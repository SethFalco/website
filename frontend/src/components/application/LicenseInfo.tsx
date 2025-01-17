import { useMatomo } from "@mitresthen/matomo-tracker-react"
import { clsx } from "clsx"
import { Trans, useTranslation } from "next-i18next"
import { TFunction } from "i18next"
import { createElement } from "react"
import {
  HiArrowTopRightOnSquare,
  HiMiniExclamationTriangle,
  HiMiniEyeSlash,
  HiMiniHandRaised,
  HiMiniHandThumbUp,
  HiMiniHeart,
  HiMiniUserGroup,
} from "react-icons/hi2"
import spdxLicenseList from "spdx-license-list"
import { DesktopAppstream } from "src/types/Appstream"
import { IconType } from "react-icons"

const licenseRefRegex = /LicenseRef-proprietary=(.*)/i

function getLicense(
  project_license: string | undefined,
  is_free_license: boolean,
  t: TFunction<"translation", undefined>,
): string | undefined {
  if (!project_license) {
    return undefined
  }

  const match = project_license.match(licenseRefRegex)
  if (match) {
    return match[1]
  }

  if (!is_free_license) {
    return t("proprietary")
  }

  const splitLicense = project_license.split(/\(|\)| /)
  if (splitLicense.length <= 1) {
    return (
      spdxLicenseList[project_license]?.name ?? project_license ?? t("unknown")
    )
  }

  return splitLicense
    .reduce((names, license) => {
      if (spdxLicenseList[license]) {
        return [...names, spdxLicenseList[license].name]
      }
      return names
    }, [])
    .join(", ")
}

const IconInCircle = ({
  color,
  icon,
}: {
  color: "green" | "yellow"
  icon: IconType
}) => {
  return (
    <div
      className={clsx(
        "h-10 w-10",
        "rounded-full p-2",
        color === "green" &&
          `text-flathub-status-green bg-flathub-status-green/25 dark:bg-flathub-status-green-dark/25 dark:text-flathub-status-green-dark`,

        color === "yellow" &&
          `text-flathub-status-yellow bg-flathub-status-yellow/25 dark:bg-flathub-status-yellow-dark/25 dark:text-flathub-status-yellow-dark`,
      )}
    >
      {createElement(icon, {
        className: "w-full h-full",
      })}
    </div>
  )
}

const LicenseInfo = ({ app }: { app: DesktopAppstream }) => {
  const { trackEvent } = useMatomo()

  const licenseIsLink = app.project_license?.match(licenseRefRegex)?.length > 0

  const isProprietary = !app.is_free_license ?? true

  const linkClicked = () => {
    trackEvent({
      category: "App",
      action: licenseIsLink ? "License" : "Homepage",
      name: app.id ?? "unknown",
    })
  }

  const { t } = useTranslation()
  const license = getLicense(app.project_license, app.is_free_license, t)

  return (
    <div className="flex flex-col gap-1 justify-center items-center text-center p-4">
      <div className="flex gap-2">
        {isProprietary ? (
          <>
            <IconInCircle color="yellow" icon={HiMiniHandRaised} />
            <IconInCircle color="yellow" icon={HiMiniExclamationTriangle} />
            <IconInCircle color="yellow" icon={HiMiniEyeSlash} />
          </>
        ) : (
          <>
            <IconInCircle color="green" icon={HiMiniHeart} />
            <IconInCircle color="green" icon={HiMiniUserGroup} />
            <IconInCircle color="green" icon={HiMiniHandThumbUp} />
          </>
        )}
      </div>
      <h1 className="text-lg font-bold">
        {t(isProprietary ? "proprietary" : "community-built")}
      </h1>
      <div>
        {isProprietary ? (
          t("proprietary-explanation")
        ) : (
          <Trans i18nKey={"common:community-built-explanation"}>
            This software is developed in the open by a community of volunteers,
            and released under the <b>{{ license }}</b>.
          </Trans>
        )}
      </div>
      {((isProprietary && licenseIsLink) ||
        (!isProprietary && app.urls.homepage)) && (
        <a
          className="flex gap-1 items-center"
          href={licenseIsLink ? license : app.urls.homepage}
          target="_blank"
          rel="noreferrer"
          onClick={linkClicked}
          title={t("open-in-new-tab")}
        >
          {t(isProprietary ? "learn-more" : "get-involved")}
          <HiArrowTopRightOnSquare />
        </a>
      )}
    </div>
  )
}

export default LicenseInfo
