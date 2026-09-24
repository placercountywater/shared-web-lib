#!/usr/bin/env node

/**
 * Verifies a consuming app satisfies the dependency contract in tiers.json.
 *
 * This library is a git submodule consumed as source, so nothing installs its
 * dependencies for the app — every package a tier imports has to be in the
 * app's own package.json, and every shadcn component a tier renders against has
 * to be vendored there. This checks both, and flags drift between the tiers an
 * app declares and the ones it actually imports. Declare them in a "shareTiers"
 * array, in vendor-components.json if the app has one, otherwise package.json.
 *
 * It ships here rather than being copied into each app so that a fix lands once
 * and travels with the contract it validates. Run it from the app root, where
 * every path below is resolved:
 *
 *   node src/share/scripts/check-tiers.mjs
 *   node src/share/scripts/check-tiers.mjs --json
 *
 * Apps wire it up as a "check-share" script.
 */

import {readFileSync, existsSync, readdirSync, statSync} from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const SHARE_DIR = path.join('src', 'share')
const TIERS_FILE = path.join(cwd, SHARE_DIR, 'tiers.json')
const MANIFEST_FILE = path.join(cwd, 'vendor-components.json')
const SHADCN_DIR = path.join(cwd, 'src', 'components', 'ui')
const SCAN_ROOTS = [path.join(cwd, 'src'), path.join(cwd, 'scripts')]
const SOURCE_EXT = new Set(['.ts', '.tsx', '.mts', '.js', '.jsx', '.mjs'])

const asJson = process.argv.includes('--json')

const errors = []
const warnings = []

function fail(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

/**
 * Parse JSON with comments and trailing commas, as tsconfig.json allows.
 *
 * Walks the text tracking string state so that a `//` inside a string value —
 * a URL, say — is not mistaken for a comment.
 */
function parseJsonc(text) {
  let out = ''
  let inString = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
        out += char
      }
      continue
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inString) {
      out += char
      if (char === '\\') {
        out += next ?? ''
        i++
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      out += char
    } else if (char === '/' && next === '/') {
      inLineComment = true
      i++
    } else if (char === '/' && next === '*') {
      inBlockComment = true
      i++
    } else {
      out += char
    }
  }

  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'))
}

/** Every source file under the scan roots, excluding the submodule itself. */
function collectSourceFiles() {
  const files = []
  const shareAbs = path.join(cwd, SHARE_DIR)

  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue
      const full = path.join(dir, entry)
      if (full === shareAbs) continue
      if (statSync(full).isDirectory()) walk(full)
      else if (SOURCE_EXT.has(path.extname(full))) files.push(full)
    }
  }

  SCAN_ROOTS.forEach(walk)
  return files
}

/**
 * Tiers this app actually imports. Matches both the `@/` alias form and any
 * depth of relative reach into the submodule.
 *
 * The captured path segment is not always a tier name. Some apps map the share
 * alias with a `core` fallback, so an import of a bare utility name resolves to
 * `core/<name>.ts`. Resolve against the filesystem the way TypeScript would,
 * rather than assuming segment === tier.
 *
 * Note this is a textual scan, so a path written in a comment or string counts
 * as an import. Avoid writing literal share paths in prose.
 */
function detectUsedTiers(files, tiers) {
  const pattern = /(?:@\/|(?:\.\.?\/)+)share\/([A-Za-z_][A-Za-z0-9_-]*)/g
  const shareAbs = path.join(cwd, SHARE_DIR)
  const used = new Map()
  const unresolved = new Map()

  const resolveTier = (segment) => {
    if (tiers[segment]) return segment
    const isCoreFile = ['.ts', '.tsx'].some((ext) =>
      existsSync(path.join(shareAbs, 'core', `${segment}${ext}`))
    )
    return isCoreFile && tiers.core ? 'core' : null
  }

  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(pattern)) {
      const tier = resolveTier(match[1])
      const bucket = tier ? used : unresolved
      const key = tier ?? match[1]
      if (!bucket.has(key)) bucket.set(key, new Set())
      bucket.get(key).add(path.relative(cwd, file))
    }
  }

  return {used, unresolved}
}

/** Expand a tier set through its `requires` edges. Tolerates cycles. */
function resolveClosure(tiers, roots) {
  const seen = new Set()
  const queue = [...roots]

  while (queue.length > 0) {
    const tier = queue.shift()
    if (seen.has(tier)) continue
    seen.add(tier)
    for (const next of tiers[tier]?.requires ?? []) queue.push(next)
  }

  return seen
}

function main() {
  if (!existsSync(TIERS_FILE)) {
    console.error(
      `Missing ${path.relative(cwd, TIERS_FILE)}. Is the submodule checked out? Try: git submodule update --init`
    )
    process.exit(1)
  }

  const {tiers} = readJson(TIERS_FILE)
  const pkg = readJson(path.join(cwd, 'package.json'))
  const manifest = existsSync(MANIFEST_FILE) ? readJson(MANIFEST_FILE) : {}

  // Apps that vendor shadcn components already keep a manifest, so shareTiers
  // lives alongside it. Apps that don't shouldn't need a phantom
  // vendor-components.json just to declare tiers, so package.json also works.
  const declaredIn = Array.isArray(manifest.shareTiers)
    ? 'vendor-components.json'
    : Array.isArray(pkg.shareTiers)
      ? 'package.json'
      : null
  const declared =
    declaredIn === 'vendor-components.json'
      ? manifest.shareTiers
      : declaredIn === 'package.json'
        ? pkg.shareTiers
        : []

  if (!declaredIn) {
    warn(
      'No "shareTiers" array in vendor-components.json or package.json — declare the tiers this app opts into so drift is detectable.'
    )
  }

  const files = collectSourceFiles()
  const {used, unresolved} = detectUsedTiers(files, tiers)

  for (const tier of declared) {
    if (!tiers[tier]) {
      fail(
        `Unknown tier "${tier}" declared in ${declaredIn}. Not defined in tiers.json.`
      )
    }
  }

  for (const [segment, importers] of unresolved) {
    fail(
      `Import of "share/${segment}" matches no tier and no core file (used by ${[...importers].join(', ')}).`
    )
  }

  for (const tier of used.keys()) {
    if (tiers[tier] && !declared.includes(tier)) {
      fail(
        `Tier "${tier}" is imported but not declared in ${declaredIn ?? 'vendor-components.json / package.json'} "shareTiers" (used by ${[...used.get(tier)].join(', ')}).`
      )
    }
  }

  // A declared tier that isn't imported is only dead if nothing else reaches it.
  // Declaring a transitive dependency explicitly is redundant, not wrong.
  const reachable = resolveClosure(
    tiers,
    [...used.keys()].filter((t) => tiers[t])
  )

  for (const tier of declared) {
    if (tiers[tier] && !used.has(tier) && !reachable.has(tier)) {
      warn(
        `Tier "${tier}" is declared but never imported — drop it from "shareTiers" if it is no longer used.`
      )
    }
  }

  const active = resolveClosure(
    tiers,
    [...new Set([...declared, ...used.keys()])].filter((t) => tiers[t])
  )

  // Every package an active tier imports must be resolvable from this app.
  const available = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {})
  ])

  for (const tier of [...active].sort()) {
    for (const dep of tiers[tier].deps) {
      if (!available.has(dep)) {
        fail(`Tier "${tier}" imports "${dep}", missing from package.json.`)
      }
    }

    for (const component of tiers[tier].shadcn) {
      if (!existsSync(path.join(SHADCN_DIR, `${component}.tsx`))) {
        fail(
          `Tier "${tier}" renders against shadcn "${component}", missing from src/components/ui/. Try: npx shadcn add ${component}`
        )
      }
    }
  }

  // `exclude` only filters what `include` globs pull in — TypeScript still
  // type-checks any file reached by an import. So excluding a tier this app
  // imports doesn't hide it from tsc; the entry is just misleading. Excludes
  // earn their keep on tiers that are NOT imported, where they stop tsc
  // compiling code whose dependencies this app never installed.
  const tsconfigPath = path.join(cwd, 'tsconfig.json')
  if (existsSync(tsconfigPath)) {
    const tsconfig = parseJsonc(readFileSync(tsconfigPath, 'utf8'))
    const excluded = (tsconfig.exclude ?? []).map((e) => e.replace(/\\/g, '/'))
    const prefix = SHARE_DIR.split(path.sep).join('/')

    for (const tier of active) {
      if (excluded.includes(`${prefix}/${tier}`)) {
        warn(
          `Tier "${tier}" is excluded in tsconfig.json but imported anyway, so tsc still checks it. The entry has no effect — remove it to avoid implying otherwise.`
        )
      }
    }

    for (const entry of excluded) {
      if (
        entry.startsWith(`${prefix}/`) &&
        !existsSync(path.join(cwd, entry))
      ) {
        warn(
          `tsconfig.json excludes "${entry}", which no longer exists. Stale entry — remove it.`
        )
      }
    }
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          active: [...active].sort(),
          declared,
          used: Object.fromEntries(
            [...used].map(([t, f]) => [t, [...f].sort()])
          ),
          errors,
          warnings
        },
        null,
        2
      )
    )
  } else {
    const direct = new Set(used.keys())
    for (const tier of [...active].sort()) {
      const via = direct.has(tier) ? 'imported' : 'transitive'
      const deps = tiers[tier].deps.join(', ') || '-'
      console.log(`${tier.padEnd(12)} ${via.padEnd(11)} ${deps}`)
    }
    console.log()
    warnings.forEach((w) => console.log(`warn   ${w}`))
    errors.forEach((e) => console.log(`error  ${e}`))
    console.log(
      errors.length === 0
        ? `ok     ${active.size} tier(s) satisfied${warnings.length > 0 ? `, ${warnings.length} warning(s)` : ''}`
        : `failed ${errors.length} error(s)`
    )
  }

  process.exit(errors.length > 0 ? 1 : 0)
}

main()
