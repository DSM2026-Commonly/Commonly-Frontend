export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  width: number;
}

const sharedHeaderMenus = [
  {
    id: "certificate-issue",
    label: "경력증명서 발급",
    href: "/career/issue",
    width: 132,
  },
  {
    id: "career-register",
    label: "경력사항 등록",
    href: "/career/register",
    width: 118,
  },
  {
    id: "career-edit",
    label: "경력사항 수정",
    href: "/career/edit",
    width: 118,
  },
] as const satisfies readonly HeaderMenuItem[];

export const userHeaderMenus = sharedHeaderMenus;

export const adminHeaderMenus = [
  ...sharedHeaderMenus,
  {
    id: "user-management",
    label: "사용자 관리",
    href: "/accounts",
    width: 103,
  },
  {
    id: "work-history",
    label: "업무 이력 조회",
    href: "/history",
    width: 122,
  },
] as const satisfies readonly HeaderMenuItem[];
