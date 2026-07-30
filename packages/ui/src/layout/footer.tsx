import "krds-react/dist/index.css";
import logo1 from "../assets/Logo/logo1.png";
import { StyledFooter } from "./footer.styles";

export interface FooterProps {
  districtOfficeHref?: string;
  directionsHref?: string;
}

function Footer({
  districtOfficeHref = "https://www.yuseong.go.kr/",
  directionsHref = "https://www.yuseong.go.kr/kor/sub06_02_04.do",
}: FooterProps) {
  return (
    <StyledFooter
      address="(34139) 대전광역시 유성구 대학로 211"
      contacts={[
        {
          title: "대표전화",
          description: "042-611-2114  |  (평일 09시-18시)",
        },
        { title: "대표팩스", description: "042-611-2569" },
      ]}
      links={[
        { text: "유성구청", href: districtOfficeHref },
        { text: "찾아오시는 길", href: directionsHref },
      ]}
      logo={{ src: logo1, alt: "유성구", width: 120, height: 41 }}
      copyright="©  2026 Team Commonly. All rights reserved."
      hideQuickLinks
      hideIdentifier
    />
  );
}

export default Footer;
