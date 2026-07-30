export interface HomeServiceItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export const homeServices = [
  {
    id: "certificate-issue",
    title: "근로자 경력증명서 발급",
    description:
      "경력증명서 발급을 신청하기 위한 민원입니다. 경력증명서에는 근로자의 인적사항과 등록된 경력정보를 바탕으로 근무기관, 근무부서, 담당업무 등의 정보가 표시됩니다.",
    href: "/career/issue",
  },
  {
    id: "career-register",
    title: "근로자 경력사항 등록",
    description:
      "근로자의 경력사항을 등록하기 위한 업무입니다. 근로자의 인적사항과 근무기관, 근무부서, 담당업무 등의 경력정보를 입력합니다.",
    href: "/career/register",
  },
  {
    id: "career-edit",
    title: "근로자 경력사항 수정",
    description:
      "등록된 경력사항을 수정하기 위한 업무입니다. 변경 또는 정정이 필요한 경력정보를 확인하고 최신 정보로 관리합니다.",
    href: "/career/edit",
  },
] as const satisfies readonly HomeServiceItem[];
