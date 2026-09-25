# Shared Web Lib

Shared web libraries used on various websites. Consumed as a **git submodule of
source files**, not as an installed package — apps mount it at `src/share` and
their own bundler compiles it.

That has one consequence worth understanding before adding anything here: since
nothing installs this package, the `dependencies` in its `package.json` are never
resolved for a consumer. Every npm package a file here imports must be present in
the **consuming app's** `package.json`. `tiers.json` records that requirement so
it can be checked instead of remembered.

## Tiers

Each top-level directory is a tier. Apps opt into the ones they use and exclude
the rest from their `tsconfig.json`, so an MUI app never type-checks the Tailwind
tiers and vice versa.

A leading `_` marks a tier apps are not meant to import. `_classnames` exists so
shared components can merge classes without depending on the app's shadcn `cn` —
app code has its own, and the two must not cross (see below). Such a tier only
ever appears in another tier's `requires`, never in an app's `shareTiers`.

Always import through the tier — `@/share/core`, never a root barrel. There is
deliberately no `index.ts` here: `check-tiers.mjs` detects tier usage by scanning
for `share/<tier>` in import paths, so a root re-export would be invisible to it.
Worse than undetected, it inverts the advice — a tier used only through a barrel
reports as "declared but never imported", and following that would delete the
declaration for a tier that is very much in use.

| Tier               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `core`             | Framework-free utilities. No dependencies at all.             |
| `_classnames`      | Tailwind class merger (`cn`).                                 |
| `hooks`            | React hooks.                                                  |
| `next`             | Next.js helpers, chiefly imgix image loaders.                 |
| `date-fns`         | Date and timezone helpers.                                    |
| `tw`               | Tailwind / Base UI primitives and stylesheets.                |
| `ui`               | shadcn-based components. See note below.                      |
| `mui`, `mui-pages` | MUI components. App Router and Pages Router variants.         |
| `slate`            | Slate rich-text editor. Pulls MUI in via its toolbar.         |
| `aws`              | S3 helpers. Reads AWS credentials from env — server-side use. |
| `blob`             | Vercel Blob helpers — server-side use.                        |
| `types`            | Ambient declarations.                                         |

**`tiers.json` is the source of truth** for what each tier needs — npm packages,
other tiers, and shadcn components. The lists live there rather than in this table
so there is only one place to keep current.

Apps validate themselves against it with `scripts/check-tiers.mjs`, which ships
here rather than being copied into each app so a fix lands once and travels with
the contract. Wire it up from the app root:

```json
"check-share": "node src/share/scripts/check-tiers.mjs"
```

It reads the app's `package.json` and `tsconfig.json`, plus a `shareTiers` array
declaring which tiers the app opts into. Put that array in `vendor-components.json`
if the app vendors shadcn components, otherwise in `package.json` — an app that
doesn't use shadcn shouldn't need a manifest just to declare tiers.

`ui` is the one tier that reaches _upward_ into the consuming app, importing its
`src/components/ui/*` shadcn copies. That is deliberate — shadcn components are
meant to be owned and edited per-app, so vendoring a frozen copy here would fight
the model. It does mean `ui` only works in a shadcn app, which `tiers.json`
records as that tier's `shadcn` requirement.

## Where `cn` lives

Import it from `_classnames`:

```ts
import {cn} from '../_classnames'
```

Consuming apps also have their own `cn`, installed by shadcn at
`src/lib/utils.ts`. **Both exist on purpose and neither should import the other.**

- Shared components can't use the app's copy. It would make every tier that merges
  classes shadcn-only — breaking `tw` for plain-Tailwind apps and `slate` for MUI
  apps — and that file is generated, rewritten by `shadcn add -o`.
- The app's copy can't be replaced by this one without taking ownership of a file
  the shadcn CLI expects to manage.

The duplication is three identical lines of a scaffolded snippet, not a versioned
dependency, so there is no upstream to track. The one real drift risk is local: if
an app ever needs `extendTailwindMerge` — custom class groups for a non-default
spacing or color scale — mirror it in `_classnames/index.ts` too, or shared components
will merge classes differently than app components.

## Icons

No tier imports an icon library, and none ships icons of its own. Components that
show an icon take it as a prop, so each app supplies one from whichever library it
already uses:

```tsx
import {SearchIcon, XIcon, DownloadIcon} from 'lucide-react'

<ImageDialog
  showToolbar
  closeIcon={<XIcon />}
  downloadIcon={<DownloadIcon />}
  trigger={
    <ImageTrigger icon={<SearchIcon className="h-8 w-8 text-white/92" />}>
      ...
    </ImageTrigger>
  }
>
```

Consuming apps are split between Lucide and Tabler, so importing either here would
force every app to install it, and maintaining a third set of hand-rolled defaults
would mean owning icons this library has no business owning.

`ImageTrigger`'s `icon` is **required** — pass `null` for none. It is required
rather than optional so that adopting this changes nothing silently: a call site
that used to get a default icon now fails to compile instead of quietly losing it.
Supply size and color yourself; the component only applies the hover/focus reveal.

`ImageDialog`'s `closeIcon` and `downloadIcon` are optional, because those toolbar
buttons are labelled "Close" and "Download" — omitting the icons leaves usable
text-only buttons rather than blank ones.

An app using these in more than one place should bind its icons once in a thin
wrapper and import from that, instead of repeating them at every call site.

## Adding to a tier

1. Add the npm package to `tiers.json` under that tier's `deps`, and any new
   cross-tier import under `requires`.
2. Add it to the consuming app's `package.json` — nothing installs it from here.
3. Run the app's `check-share` to confirm the contract still holds.

Don't introduce a cross-tier import that drags a UI library somewhere it doesn't
belong — `core` and `hooks` must never reach into `mui`, `tw`, or `ui`.

## Commit Messages

Use plain [Conventional Commits](https://www.conventionalcommits.org/):

```text
type: short summary

Optional body explaining the why, wrapped at about 72 characters.

Trailer-Key: value
```

Examples:

```text
fix: forward ref through ImageTrigger
docs: record why cn is duplicated per app
refactor: simplify useScrolledToBottomRef
deps: upgrade next and react
feat!: require an explicit icon prop on ImageTrigger
```

Quick guidelines:

- Use a short imperative summary, like "add", "correct", "update", or "remove".
- Keep the first line concise. Around 50 to 72 characters is a good target.
- Skip the period at the end of the first line.
- Add a longer body below the first line when the "why" is not obvious.
- Mark a breaking change with `!` after the type, or a `BREAKING CHANGE:` trailer.

Breaking changes matter more here than in a normal package. Consuming apps track
this repo as a submodule pinned to a commit, so a rename or a prop that becomes
required lands the moment an app runs `git submodule update --remote`. Say so in
the subject.

### Crediting whoever asked

When someone else requested a change, record it as a git _trailer_ at the end of
the message rather than in the subject line:

```text
feat: add a downloadIcon prop to ImageDialog

Requested-by: John Doe <jdoe@example.com>
```

Trailers are `Key: value` lines in a block at the very end, separated from the
body by one blank line, with no blank lines between them. Git parses them
natively, so unlike a `(J. Doe)` suffix they are queryable:

```shell
# who asked for what
git log --format='%h %s%n    %(trailers:key=Requested-by,valueonly)'

# every change a given person requested
git log --grep='Requested-by:.*Doe'
```

Which trailer to use:

| Trailer           | When to use it                                          |
| ----------------- | ------------------------------------------------------- |
| `Requested-by:`   | They asked for this change                              |
| `Reported-by:`    | They reported the bug being fixed                       |
| `Suggested-by:`   | They floated the idea rather than requesting it         |
| `Co-authored-by:` | They helped write it — GitHub credits them as an author |

Use full names, with an email address when you know it. Do not reach for
`Co-authored-by:` for someone who only requested a change; GitHub renders it as
authorship. Self-initiated work needs no trailer at all — git already records
the author.

There is not one universal list of commit prefixes used everywhere, but these are the most common and safest ones to use:

| Prefix      | When to use it                                                             |
| ----------- | -------------------------------------------------------------------------- |
| `feat:`     | A new feature or new user-visible behavior                                 |
| `fix:`      | A bug fix, regression fix, or broken behavior correction                   |
| `docs:`     | README, guides, comments, or documentation-only changes                    |
| `style:`    | Formatting or stylistic cleanup with no behavior change                    |
| `refactor:` | Code restructuring with no intended behavior change                        |
| `perf:`     | A change mainly intended to improve performance                            |
| `test:`     | Adding or updating tests without changing production behavior              |
| `build:`    | Build tooling, dependency packaging, or bundler/config changes             |
| `ci:`       | GitHub Actions, Vercel, or other CI/CD workflow changes                    |
| `chore:`    | Maintenance work that does not fit the other categories                    |
| `revert:`   | Reverting an earlier commit                                                |
| `deps:`     | Dependency upgrades or package version bumps                               |
| `security:` | Security-related fixes or hardening                                        |
| `migrate:`  | Porting a component or hook to a new library or API                        |
| `wip:`      | Work in progress; useful locally, but usually best cleaned up before merge |

If you are not sure which one to pick, this shortcut usually works:

- New thing: `feat:`
- Broken thing: `fix:`
- Cleanup without behavior change: `refactor:`
- Documentation only: `docs:`
- Tooling or maintenance: `chore:` or `deps:`
