import type { MouseEvent } from "react";
import {
  ArrowIcon,
  HeroContent,
  HeroDescription,
  HeroSection,
  HeroTitle,
  HomeInner,
  HomeRoot,
  ServiceCard,
  ServiceDescription,
  ServiceLink,
  ServiceList,
  ServicesSection,
  ServicesTitle,
  ServiceTitle,
} from "./home.styles";
import { homeServices } from "./homeServices";

export interface UserHomeProps {
  onNavigate?: (href: string) => void;
}

function UserHome({ onNavigate }: UserHomeProps) {
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
    <HomeRoot>
      <HomeInner>
        <HeroSection aria-labelledby="user-home-title">
          <HeroContent>
            <HeroTitle id="user-home-title">
              유성구청 기간제 근로자
              <br />
              경력관리 시스템
            </HeroTitle>
            <HeroDescription>
              경력정보 등록부터 증명서 발급까지, 한 곳에서 관리하세요.
            </HeroDescription>
          </HeroContent>
        </HeroSection>

        <ServicesSection aria-labelledby="user-home-services-title">
          <ServicesTitle id="user-home-services-title">
            민원 서비스
          </ServicesTitle>
          <ServiceList>
            {homeServices.map((service) => (
              <ServiceCard key={service.id}>
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                <ServiceLink
                  href={service.href}
                  variant="basic"
                  size="medium"
                  underline="none"
                  preserveColorOnHover
                  aria-label={`${service.title} 바로가기`}
                  icon={<ArrowIcon aria-hidden="true">→</ArrowIcon>}
                  onClick={(event) =>
                    handleNavigation(event, service.href)
                  }
                >
                  바로가기
                </ServiceLink>
              </ServiceCard>
            ))}
          </ServiceList>
        </ServicesSection>
      </HomeInner>
    </HomeRoot>
  );
}

export default UserHome;
