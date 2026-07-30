import logo from "../assets/Logo/logo1.png";
import type { MouseEvent } from "react";
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
  UtilityRow,
  UtilityText,
} from "./header.styles";

export type HeaderVariant = "admin" | "user" | "civil" | "not-auth";

export interface HeaderProps {
  variant?: HeaderVariant;
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
  onExtend,
  onLogout,
  onNavigate,
}: HeaderProps) => {
  const configuration = headerConfigurations[variant];
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
    <HeaderRoot
      id={`${variant}-header`}
      $compact={!configuration.showUtility}
    >
      <HeaderBody $compact={!configuration.showUtility}>
        {configuration.showUtility && (
          <UtilityRow>
            <UtilityText>전재준 님</UtilityText>
            <UtilityDivider aria-hidden="true" />
            <UtilityText $width={125}>
              남은시간 00분 00초
            </UtilityText>
            <UtilityButton
              variant="text"
              size="small"
              type="button"
              $width={30}
              onClick={onExtend}
            >
              연장
            </UtilityButton>
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
                      onClick={(event) =>
                        handleNavigation(event, menu.href)
                      }
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
