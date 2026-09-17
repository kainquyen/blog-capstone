import type { ReactNode } from "react"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text
} from "react-email"

import { cn } from "../../../lib/utils"
import {
  type EmailClassNames,
  type EmailColors,
  EmailStyles
} from "./email-styles"

const deleteAccountVerificationEmailLocalization = {
  ACCOUNT_DELETION_REQUESTED: "Yêu cầu xóa tài khoản",
  CONFIRM_ACCOUNT_DELETION: "Xác nhận xóa tài khoản",
  LOGO: "Logo",
  WE_RECEIVED_ACCOUNT_DELETION_REQUEST:
    "Chúng tôi đã nhận được yêu cầu xóa vĩnh viễn tài khoản {appName} của bạn.",
  ACCOUNT: "Tài khoản:",
  DELETION_IS_PERMANENT:
    "Xóa tài khoản sẽ xóa toàn bộ dữ liệu của bạn vĩnh viễn. Hành động này không thể hoàn tác.",
  DELETE_MY_ACCOUNT: "Xóa tài khoản của tôi",
  OR_COPY_AND_PASTE_URL: "Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:",
  THIS_LINK_EXPIRES_IN_HOURS: "Liên kết này sẽ hết hạn sau {expirationHours} giờ.",
  EMAIL_SENT_BY: "Email được gửi bởi {appName}.",
  IF_YOU_DIDNT_REQUEST_ACCOUNT_DELETION:
    "Nếu bạn không yêu cầu xóa tài khoản, bạn có thể an tâm bỏ qua email này. Tài khoản của bạn sẽ vẫn tiếp tục hoạt động.",
  POWERED_BY_BETTER_AUTH: "Được cung cấp bởi {betterAuth}"
}

/**
 * Localization strings for the DeleteAccountVerificationEmail component.
 */
export type DeleteAccountVerificationEmailLocalization =
  typeof deleteAccountVerificationEmailLocalization

/**
 * Props for the DeleteAccountVerificationEmail component.
 */
export interface DeleteAccountVerificationEmailProps {
  /** Account deletion verification URL sent by Better Auth */
  url: string
  /** Email address of the account scheduled for deletion */
  email?: string
  /** Name of the application sending the email */
  appName?: string
  /** Number of hours until the verification link expires */
  expirationHours?: number
  /** Logo URL(s) - a single string or light/dark variants. If omitted, no logo is shown. */
  logoURL?: string | { light: string; dark: string }
  /** Custom CSS class names for styling specific parts of the email */
  classNames?: EmailClassNames
  /** Custom color scheme for light and dark modes */
  colors?: EmailColors
  /** Whether to show the "Powered by better-auth" footer */
  poweredBy?: boolean
  /** Whether to enable dark mode support */
  darkMode?: boolean
  /** Additional React nodes to inject into the email head */
  head?: ReactNode
  /**
   * Localization overrides for customizing email text
   * @remarks `DeleteAccountVerificationEmailLocalization`
   */
  localization?: Partial<DeleteAccountVerificationEmailLocalization>
}

/**
 * Email template for verifying a permanent account deletion request.
 *
 * Use this template with Better Auth's
 * `user.deleteUser.sendDeleteAccountVerification` callback.
 *
 * @example
 * ```tsx
 * <DeleteAccountVerificationEmail
 *   url="https://example.com/api/auth/delete-user/callback?token=abc123"
 *   email="user@example.com"
 *   appName="My App"
 *   expirationHours={24}
 * />
 * ```
 */
export const DeleteAccountVerificationEmail = ({
  url,
  email,
  appName,
  expirationHours = 24,
  logoURL,
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: DeleteAccountVerificationEmailProps) => {
  const localization = {
    ...DeleteAccountVerificationEmail.localization,
    ...props.localization
  }

  const requestText = localization.WE_RECEIVED_ACCOUNT_DELETION_REQUEST.replace(
    "{appName}",
    appName || ""
  )
    .replace(/\s{2,}/g, " ")
    .replace(" .", ".")

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />

        <EmailStyles colors={colors} darkMode={darkMode} />

        {head}
      </Head>

      <Preview>{localization.ACCOUNT_DELETION_REQUESTED}</Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className={cn("bg-background font-sans", classNames?.body)}>
          <Container
            className={cn(
              "mx-auto my-auto max-w-xl px-2 py-10",
              classNames?.container
            )}
          >
            <Section
              className={cn(
                "rounded-none border border-border bg-card p-8 text-card-foreground",
                classNames?.card
              )}
            >
              {logoURL &&
                (typeof logoURL === "string" ? (
                  <Img
                    alt={appName || localization.LOGO}
                    className={cn("mx-auto mb-8", classNames?.logo)}
                    height={48}
                    src={logoURL}
                    width={48}
                  />
                ) : (
                  <>
                    <Img
                      alt={appName || localization.LOGO}
                      className={cn(
                        "logo-light mx-auto mb-8",
                        classNames?.logo
                      )}
                      height={48}
                      src={logoURL.light}
                      width={48}
                    />
                    <Img
                      alt={appName || localization.LOGO}
                      className={cn(
                        "logo-dark hidden mx-auto mb-8",
                        classNames?.logo
                      )}
                      height={48}
                      src={logoURL.dark}
                      width={48}
                    />
                  </>
                ))}

              <Heading
                className={cn(
                  "m-0 mb-5 text-2xl font-semibold",
                  classNames?.title
                )}
              >
                {localization.CONFIRM_ACCOUNT_DELETION}
              </Heading>

              <Text className={cn("text-sm", classNames?.content)}>
                {requestText}
              </Text>

              {email && (
                <Section
                  className={cn(
                    "my-6 border border-border bg-muted p-4",
                    classNames?.codeBlock
                  )}
                >
                  <Text
                    className={cn(
                      "m-0 mb-2 text-xs text-muted-foreground",
                      classNames?.description
                    )}
                  >
                    {localization.ACCOUNT}
                  </Text>
                  <Text
                    className={cn(
                      "m-0 text-sm font-semibold",
                      classNames?.content
                    )}
                  >
                    {email}
                  </Text>
                </Section>
              )}

              <Text
                className={cn("text-sm font-semibold", classNames?.content)}
              >
                {localization.DELETION_IS_PERMANENT}
              </Text>

              <Section className="my-6">
                <Button
                  className={cn(
                    "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground no-underline",
                    classNames?.button
                  )}
                  href={url}
                >
                  {localization.DELETE_MY_ACCOUNT}
                </Button>
              </Section>

              <Text
                className={cn(
                  "m-0 mb-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.OR_COPY_AND_PASTE_URL}
              </Text>

              <Link
                className={cn(
                  "break-all text-xs text-primary",
                  classNames?.link
                )}
                href={url}
              >
                {url}
              </Link>

              <Hr
                className={cn(
                  "my-6 w-full border border-solid border-border",
                  classNames?.separator
                )}
              />

              <Text
                className={cn(
                  "m-0 mb-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.THIS_LINK_EXPIRES_IN_HOURS.replace(
                  "{expirationHours}",
                  expirationHours.toString()
                )}
                {appName &&
                  ` ${localization.EMAIL_SENT_BY.replace("{appName}", appName)}`}
              </Text>

              <Text
                className={cn(
                  "m-0 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.IF_YOU_DIDNT_REQUEST_ACCOUNT_DELETION}
              </Text>

              {poweredBy && (
                <Text
                  className={cn(
                    "m-0 mt-4 text-center text-[11px] text-muted-foreground",
                    classNames?.poweredBy
                  )}
                >
                  {(() => {
                    const [beforeBetterAuth, afterBetterAuth] =
                      localization.POWERED_BY_BETTER_AUTH.split("{betterAuth}")

                    return (
                      <>
                        {beforeBetterAuth}
                        <Link
                          className={cn(
                            "text-primary underline",
                            classNames?.link
                          )}
                          href="https://better-auth.com"
                        >
                          better-auth
                        </Link>
                        {afterBetterAuth}
                      </>
                    )
                  })()}
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

DeleteAccountVerificationEmail.localization =
  deleteAccountVerificationEmailLocalization

DeleteAccountVerificationEmail.PreviewProps = {
  url: "https://better-auth-ui.com/api/auth/delete-user/callback?token=example-token",
  email: "user@example.com",
  appName: "Better Auth",
  poweredBy: true,
  darkMode: true
} as DeleteAccountVerificationEmailProps

export default DeleteAccountVerificationEmail
