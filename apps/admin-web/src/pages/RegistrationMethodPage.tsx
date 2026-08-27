import {
  RegistrationMethodSelector,
  type RegistrationMethodOption,
} from "@commonly/ui";
import { useNavigate } from "react-router";

const registrationMethods = [
  {
    id: "individual",
    href: "/career/register/individual",
    title: "경력사항 개별 등록",
    description: "경력사항을 직접 입력하여 등록할 수 있습니다.",
  },
  {
    id: "bulk",
    href: "/career/register/bulk",
    title: "경력사항 통합 등록",
    description: "경력사항을 엑셀 파일로 한번에 등록할 수 있습니다.",
  },
] as const satisfies readonly [
  RegistrationMethodOption,
  RegistrationMethodOption,
];

function RegistrationMethodPage() {
  const navigate = useNavigate();

  const handleSelect = (option: RegistrationMethodOption) => {
    void navigate(option.href);
  };

  return (
    <RegistrationMethodSelector
      title="등록 방법을 선택해주세요"
      options={registrationMethods}
      informationTitle="데이터 등록 안내"
      informationItems={[
        "등록 대상자의 인적사항이 일치하는지 확인하여 주시기 바랍니다.",
        "등록 완료 전 입력 내용을 다시 한번 확인하여 주시기 바랍니다.",
      ]}
      onSelect={handleSelect}
    />
  );
}

export default RegistrationMethodPage;
