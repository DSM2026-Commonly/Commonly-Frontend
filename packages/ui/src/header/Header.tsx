import logo from "../assets/Logo/logo1.png";
import { reissueAuthToken } from "@commonly/utils";
import { useState, type MouseEvent } from "react";
import useAuthSession from "../hooks/useAuthSession";
import useMe from "../hooks/useMe";
import { PASSWORD_CHANGE_PATH } from "../pages/PasswordChangePage";
import {
  adminHeaderMenus,
  type HeaderMenuItem,
  userHeaderMenus,
} from "./headerMenuData";
import {
  BrandLink,
  BrandLogo,
  BrandTitle,
  HeaderBody,
  HeaderRoot,
  MainRow,
  PrimaryNavigation,
  PrimaryNavigationLink,
  PrimaryNavigationList,
  UtilityButton,
  UtilityDivider,
  UtilityLink,
  UtilityNotice,
  UtilityRow,
  UtilityText,
} from "./header.styles";

export type HeaderVariant = "admin" | "user" | "civil" | "not-auth";

export interface HeaderProps {
  variant?: HeaderVariant;
  /** 표시할 사용자명. 생략하면 저장된 로그인 토큰에서 읽는다. */
  userName?: string;
  /** 생략하면 리프레시 토큰으로 액세스 토큰을 재발급해 로그인 시간을 연장한다. */
  onExtend?: () => void;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
}

const headerConfigurations = {
  admin: {
    title: "경력관리 관리자 시스템",
    brandWidth: 306.204,
    titleWidth: 176,
    showUtility: true,
    menus: adminHeaderMenus,
  },
  user: {
    title: "경력관리 담당자 시스템",
    brandWidth: 306.204,
    titleWidth: 176,
    showUtility: true,
    menus: userHeaderMenus,
  },
  civil: {
    title: "경력관리 시스템",
    brandWidth: 251.204,
    titleWidth: 121,
    showUtility: true,
    menus: [],
  },
  "not-auth": {
    title: "경력관리 시스템",
    brandWidth: 251.204,
    titleWidth: 121,
    showUtility: false,
    menus: [],
  },
} as const satisfies Record<
  HeaderVariant,
  {
    title: string;
    brandWidth: number;
    titleWidth: number;
    showUtility: boolean;
    menus: readonly HeaderMenuItem[];
  }
>;

const Header = ({
  variant = "admin",
  userName,
  onExtend,
  onLogout,
  onNavigate,
}: HeaderProps) => {
  const configuration = headerConfigurations[variant];
  const { session, remainingTime } = useAuthSession();
  const me = useMe();
  const [extendStatus, setExtendStatus] = useState<
    "idle" | "extending" | "failed"
  >("idle");
  // 토큰에는 계정 id 만 있어, 내 정보 조회로 실명을 받으면 그걸 보여준다.
  const displayName = userName ?? (me?.name || session?.name || "");
  // 새 토큰이 저장되면 남은 시간이 다시 계산된다. 실패해도 지금 토큰이 끝날 때까지는 계속 쓸 수 있다.
  const handleExtend = async () => {
    if (onExtend) {
      onExtend();
      return;
    }

    if (extendStatus === "extending") {
      return;
    }

    setExtendStatus("extending");

    try {
      await reissueAuthToken();
      setExtendStatus("idle");
    } catch {
      setExtendStatus("failed");
    }
  };
  const handleNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (
      !onNavigate ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <HeaderRoot id={`${variant}-header`} $compact={!configuration.showUtility}>
      <HeaderBody $compact={!configuration.showUtility}>
        {configuration.showUtility && (
          <UtilityRow>
            <UtilityText>
              {displayName ? `${displayName} 님` : "로그인 사용자"}
            </UtilityText>
            <UtilityDivider aria-hidden="true" />
            <UtilityText $width={125}>남은시간 {remainingTime}</UtilityText>
            <UtilityButton
              variant="text"
              size="small"
              type="button"
              $width={30}
              disabled={extendStatus === "extending"}
              onClick={() => void handleExtend()}
            >
              연장
            </UtilityButton>
            {extendStatus === "failed" && (
              <UtilityNotice role="status">
                연장할 수 없습니다. 다시 로그인해 주세요.
              </UtilityNotice>
            )}
            <UtilityDivider aria-hidden="true" />
            <UtilityLink
              href={PASSWORD_CHANGE_PATH}
              variant="unstyled"
              underline="none"
              size="small"
              $width={92}
              onClick={(event) => handleNavigation(event, PASSWORD_CHANGE_PATH)}
            >
              비밀번호 변경
            </UtilityLink>
            <UtilityDivider aria-hidden="true" />
            <UtilityButton
              variant="text"
              size="small"
              type="button"
              $width={56}
              onClick={onLogout}
            >
              로그아웃
            </UtilityButton>
          </UtilityRow>
        )}

        <MainRow>
          <BrandLink
            href="/"
            variant="unstyled"
            underline="none"
            aria-label={`유성구 ${configuration.title} 홈`}
            $width={configuration.brandWidth}
            onClick={(event) => handleNavigation(event, "/")}
          >
            <BrandLogo
              src={logo}
              alt="유성구 Yuseong District"
              width={120}
              height={41}
            />
            <BrandTitle $width={configuration.titleWidth}>
              {configuration.title}
            </BrandTitle>
          </BrandLink>

          {configuration.menus.length > 0 && (
            <PrimaryNavigation aria-label={`${configuration.title} 주요 메뉴`}>
              <PrimaryNavigationList>
                {configuration.menus.map((menu) => (
                  <li key={menu.id}>
                    <PrimaryNavigationLink
                      href={menu.href}
                      variant="unstyled"
                      underline="none"
                      $width={menu.width}
                      onClick={(event) => handleNavigation(event, menu.href)}
                    >
                      {menu.label}
                    </PrimaryNavigationLink>
                  </li>
                ))}
              </PrimaryNavigationList>
            </PrimaryNavigation>
          )}
        </MainRow>
      </HeaderBody>
    </HeaderRoot>
  );
};

export default Header;
