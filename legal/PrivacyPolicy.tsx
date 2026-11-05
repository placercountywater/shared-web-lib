import type {ReactNode} from 'react'
import {cn} from '../_classnames'
import {Paragraph, TextLink} from '../tw'

type Agency = {
  /** Full legal name, spelled out on first use. */
  name: string
  /** Short form used for the rest of the document. */
  abbr: string
}

type Contact = {
  /** Where "Contact Us" points. PCWA's own page by default, since privacy
      requests are handled by PCWA Customer Services for every agency site. */
  href: string
  email: string
  phone: string
  address: string
  publicRecordsHref: string
}

type PrivacyPolicyProps = {
  /** The site this policy covers. `label` is what reads in prose, so it is the
      bare host — "mfpfa.pcwa.net" — rather than the full href. */
  site: {href: string; label: string}
  /** Rendered under the page title and referred to by the Updates section. */
  effectiveDate: string
  agency?: Agency
  contact?: Partial<Contact>
  /** The SMS/10DLC section. Only true for a site that collects phone numbers
      and texts them — pcwa.net does, the satellite sites do not. */
  includeSms?: boolean
  /** Prose link color, e.g. "text-primary". TextLink inherits its color by
      design, so without this every link here is body-text color. */
  linkClassName?: string
  className?: string
}

const DEFAULT_AGENCY: Agency = {
  name: 'Placer County Water Agency',
  abbr: 'PCWA'
}

const DEFAULT_CONTACT: Contact = {
  href: 'https://www.pcwa.net/contact-us',
  email: 'customerservices@pcwa.net',
  phone: '(530) 823-4850',
  address: '144 Ferguson Road, Auburn, CA 95603',
  publicRecordsHref: 'https://docs.pcwa.net/public-records-request.pdf'
}

type Section = {
  id: string
  heading: string
  body: ReactNode
}

/**
 * PCWA's Privacy Policy, as approved for pcwa.net and carried to the agency's
 * other public sites.
 *
 * The wording is the approved text and should not be edited casually — treat a
 * change here as a change to a legal document on every site that mounts it.
 * What varies between sites is passed in rather than forked: which site the
 * policy is about, who to contact, and whether the SMS section applies.
 *
 * Sections number themselves from their position in the array below, and the
 * "On this page" nav is built from the same array, so dropping a section
 * renumbers the rest and updates the nav with no second place to keep in step.
 *
 * It renders the policy body only — no page title, container or metadata. That
 * chrome differs per site and belongs to the app.
 */
export default function PrivacyPolicy({
  site,
  effectiveDate,
  agency = DEFAULT_AGENCY,
  contact: contactProp,
  includeSms = false,
  linkClassName,
  className
}: PrivacyPolicyProps) {
  const contact = {...DEFAULT_CONTACT, ...contactProp}
  const sections: Section[] = [
    {
      id: 'introduction',
      heading: 'Introduction',
      body: (
        <>
          <Paragraph>
            {agency.name} ({agency.abbr}) respects the privacy of visitors to
            our website (
            <TextLink className={linkClassName} href={site.href}>
              {site.label}
            </TextLink>
            ) and online services. This Privacy Policy explains what information
            we collect, how we use and protect it, and the choices available to
            you. As a public agency, we aim to use clear language while meeting
            applicable legal requirements.
          </Paragraph>
          <Paragraph>
            By using our website, you agree to the practices described in this
            policy.
          </Paragraph>
        </>
      )
    },
    {
      id: 'information-we-collect',
      heading: 'Information We Collect',
      body: (
        <>
          <Paragraph>We collect information in the following ways:</Paragraph>
          <ul className="mb-4 list-disc space-y-3 pl-5">
            <li>
              <span className="font-medium">
                Information you provide directly
              </span>
              <p className="mt-1 text-sm leading-relaxed">
                If you complete a form on our site—such as a contact form,
                service request, program enrollment, or newsletter sign-up—we
                collect the information you submit (for example: name, email
                address, phone number, service address, account number, and the
                content of your message).
              </p>
            </li>
            <li>
              <span className="font-medium">
                Information collected automatically
              </span>
              <p className="mt-1 text-sm leading-relaxed">
                When you visit our site, we and our service providers may
                automatically collect certain information, such as your IP
                address, browser type, device identifiers, pages viewed,
                referring/exit pages, and timestamps. We use this information to
                operate, secure, and improve our website.
              </p>
            </li>
            <li>
              <span className="font-medium">
                Cookies and similar technologies
              </span>
              <p className="mt-1 text-sm leading-relaxed">
                We use cookies and similar technologies to remember preferences
                and understand how visitors use our site. You can manage cookies
                through your browser settings. See{' '}
                <TextLink
                  className={linkClassName}
                  href="#cookies-and-analytics"
                >
                  Cookies &amp; Analytics
                </TextLink>{' '}
                for details.
              </p>
            </li>
          </ul>
          <Paragraph>
            We do not collect sensitive personal information via the public
            website unless you choose to provide it in a form field or as
            required by law for a service.
          </Paragraph>
          <Paragraph>
            We do not collect information from third parties. All information we
            receive is provided directly by visitors through forms or
            automatically through basic analytics tools.
          </Paragraph>
        </>
      )
    },
    {
      id: 'how-we-use-information',
      heading: 'How We Use Information',
      body: (
        <>
          <Paragraph>We use the information we collect to:</Paragraph>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>Provide requested services, information, and support.</li>
            <li>
              Operate, maintain, and improve our website and online services.
            </li>
            <li>Respond to inquiries, service requests, and feedback.</li>
            <li>
              Send notices or updates you opt in to receive (e.g.,
              {includeSms
                ? ' newsletters and SMS text messages'
                : ' newsletters'}
              ).
            </li>
            <li>
              Detect, prevent, and address technical issues and security
              incidents.
            </li>
            <li>
              Comply with legal obligations and public records requirements.
            </li>
          </ul>
          <Paragraph>
            We do <strong>not</strong> sell personal information. We also do not
            share personal information for cross-context behavioral advertising.
          </Paragraph>
        </>
      )
    },
    {
      id: 'cookies-and-analytics',
      heading: 'Cookies & Analytics',
      body: (
        <>
          <Paragraph>
            We do not use cookies for cross-context behavioral advertising. We
            use Google Analytics (GA4) to help understand website usage. Google
            Analytics uses cookies and similar technologies to collect
            information such as pages visited, session duration, and approximate
            geography (derived from IP). GA4 does not log or expose full IP
            addresses to us. We use the aggregated reports to improve content,
            accessibility, and performance.
          </Paragraph>
          <Paragraph>
            We also use Vercel Analytics and Vercel Speed Insights, provided by
            our website host, to measure page views and site performance.
            Neither uses cookies, and neither tracks visitors across other
            websites. They report aggregated traffic and performance data only.
          </Paragraph>
          <Paragraph>
            You can manage or disable cookies in your browser settings. You can
            also learn more about how Google uses data at{' '}
            <TextLink
              className={linkClassName}
              href="https://policies.google.com/technologies/partner-sites"
            >
              Google’s Partner Sites policy
            </TextLink>{' '}
            and opt out of Google Analytics by installing the{' '}
            <TextLink
              className={linkClassName}
              href="https://tools.google.com/dlpage/gaoptout"
            >
              Google Analytics Opt-out Browser Add-on
            </TextLink>
            .
          </Paragraph>
          <Paragraph>
            If you adjust your cookie settings, some features of the site may
            not function as intended.
          </Paragraph>
        </>
      )
    },
    ...(includeSms
      ? [
          {
            id: 'sms-text-messaging',
            heading: 'SMS Text Messaging (Zoom & 10DLC)',
            body: (
              <>
                <Paragraph>
                  {agency.abbr} may use Zoom’s SMS capabilities to send text
                  messages related to service updates, customer communications,
                  or information you request. We will only send SMS messages if
                  you provide your phone number and consent to receive texts.
                  Message frequency may vary. Message and data rates may apply.
                </Paragraph>
                <Paragraph>
                  By providing a telephone number and submitting a form on our
                  website, you acknowledge our Privacy Policy and consent to
                  receive SMS text messages from {agency.abbr} for the stated
                  purpose. You can opt out at any time by replying{' '}
                  <strong>STOP</strong>. For assistance, reply{' '}
                  <strong>HELP</strong>.
                </Paragraph>
                <Paragraph>
                  <strong>Mobile information privacy.</strong> No mobile
                  information will be shared with third parties/affiliates for
                  marketing or promotional purposes. All other data sharing
                  categories exclude text messaging originator opt‑in data and
                  consent; this information will not be shared with any third
                  parties.
                </Paragraph>
                <Paragraph>
                  If we include URLs in SMS, they will direct you to{' '}
                  {agency.abbr} pages or trusted resources relevant to your
                  request. {agency.abbr} does not send age‑gated content or
                  lending/loan offers via SMS.
                </Paragraph>
              </>
            )
          }
        ]
      : []),
    {
      id: 'how-we-protect-information',
      heading: 'How We Protect Information',
      body: (
        <>
          <Paragraph>
            We use administrative, technical, and physical safeguards designed
            to protect the information we collect. While we strive to protect
            your information, no method of transmission over the Internet or
            method of electronic storage is 100% secure.
          </Paragraph>
          <Paragraph>
            <strong>Retention.</strong> We retain information only as long as
            necessary for the purposes described in this policy, to meet legal
            or operational requirements, or as required under the California
            Public Records Act. When no longer required, we delete or anonymize
            information, or securely store it until deletion is possible.
          </Paragraph>
        </>
      )
    },
    {
      id: 'your-rights',
      heading: 'Your Rights & Choices (California)',
      body: (
        <>
          <Paragraph>
            California residents may have rights under the California Consumer
            Privacy Act (as amended by the CPRA), including the right to know,
            correct, and delete certain personal information we maintain about
            you, and the right to be free from unlawful discrimination for
            exercising these rights.
          </Paragraph>
          <ul className="mb-4 list-disc space-y-2 pl-5">
            <li>
              <strong>Right to Know/Access:</strong> Request information about
              the categories and specific pieces of personal information we
              collected about you.
            </li>
            <li>
              <strong>Right to Delete:</strong> Request deletion of personal
              information, subject to legal exceptions.
            </li>
            <li>
              <strong>Right to Correct:</strong> Request that we correct
              inaccurate personal information.
            </li>
            <li>
              <strong>Right to Opt-Out of Sale/Sharing:</strong> We do{' '}
              <em>not</em> sell personal information or share it for
              cross-context behavioral advertising.
            </li>
          </ul>
          <Paragraph>
            To exercise these rights, contact us using the methods on our{' '}
            <TextLink
              className={cn('whitespace-nowrap', linkClassName)}
              href={contact.href}
            >
              Contact Us
            </TextLink>{' '}
            page. We will verify your request consistent with applicable law
            (for example, by confirming information you already provided) and
            respond within the timeframes required by law.
          </Paragraph>
          <Paragraph>
            Authorized agents may submit requests on your behalf with written
            permission.
          </Paragraph>
          <Paragraph>
            To submit a privacy request, email{' '}
            <TextLink
              className={linkClassName}
              href={`mailto:${contact.email}?subject=Privacy%20Request`}
            >
              {contact.email}
            </TextLink>{' '}
            with “Privacy Request” in the subject line.
          </Paragraph>
          <Paragraph>
            <strong>Do Not Track.</strong> Our site does not respond to browser
            &quot;Do Not Track&quot; signals. You can manage cookie preferences
            through your browser and the Google Analytics opt-out noted above.
          </Paragraph>
        </>
      )
    },
    {
      id: 'children',
      heading: 'Children’s Privacy',
      body: (
        <Paragraph>
          Our website is intended for a general audience and not directed to
          children under 13. We do not knowingly collect personal information
          from children under 13 via the website. If you believe a child has
          provided us personal information, please contact us so we can take
          appropriate action.
        </Paragraph>
      )
    },
    {
      id: 'third-party-links',
      heading: 'Links to Other Websites',
      body: (
        <Paragraph>
          Our site may link to third-party websites or services we do not
          operate. We are not responsible for the privacy practices of those
          sites. We encourage you to review the privacy policies of any
          third-party site you visit.
        </Paragraph>
      )
    },
    {
      id: 'changes',
      heading: 'Updates to This Policy',
      body: (
        <Paragraph>
          We may update this Privacy Policy from time to time. When we make
          changes, we will revise the “Effective Date” above. Your continued use
          of the site after changes are posted means you accept those changes.
        </Paragraph>
      )
    },
    {
      id: 'contact',
      heading: 'Contact Us',
      body: (
        <>
          <Paragraph>
            If you have questions about this Privacy Policy or wish to exercise
            your privacy rights, please visit our{' '}
            <TextLink
              className={cn('whitespace-nowrap', linkClassName)}
              href={contact.href}
            >
              Contact Us
            </TextLink>{' '}
            page or reach out using one of the methods below.
          </Paragraph>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong>Email:</strong>{' '}
              <TextLink
                className={linkClassName}
                href={`mailto:${contact.email}`}
              >
                {contact.email}
              </TextLink>
            </li>
            <li>
              <strong>Phone:</strong>{' '}
              <span className="whitespace-nowrap">{contact.phone}</span>
            </li>
            <li>
              <strong>Mailing Address:</strong> {contact.address}
            </li>
          </ul>
          <Paragraph>
            For public records requests under the California Public Records Act,
            please use our{' '}
            <TextLink
              className={linkClassName}
              href={contact.publicRecordsHref}
            >
              Public Records Request Form (PDF)
            </TextLink>
            .
          </Paragraph>
          <Paragraph>
            Please do not include sensitive personal information in form
            submissions unless specifically requested for a service. Public
            records laws may require that certain communications be retained and
            disclosed upon request.
          </Paragraph>
        </>
      )
    }
  ]

  return (
    <div className={cn(className)}>
      <p className="text-muted-foreground mb-6 text-sm">
        Effective Date: {effectiveDate}
      </p>

      <nav aria-label="Privacy policy sections" className="mb-6">
        <p className="mb-1 font-semibold">On this page</p>
        <ul className="list-disc space-y-0.5 pl-5">
          {sections.map(({id, heading}, i) => (
            <li key={id}>
              <TextLink className={linkClassName} href={`#${id}`}>
                {i + 1}. {heading}
              </TextLink>
            </li>
          ))}
        </ul>
      </nav>

      {sections.map(({id, heading, body}, i) => (
        <section key={id} id={id} className="scroll-mt-24">
          <hr className="border-border my-6 border-t" />
          <h2 className="mb-2">
            {i + 1}. {heading}
          </h2>
          {body}
        </section>
      ))}

      <p className="text-muted-foreground mt-10 text-xs">
        © {new Date().getFullYear()} {agency.name}. All rights reserved.
      </p>
    </div>
  )
}

export type {PrivacyPolicyProps}
