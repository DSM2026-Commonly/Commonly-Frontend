import "krds-react/dist/index.css";

import { useId } from "react";
import {
  ArrowIcon,
  InformationBox,
  InformationHeader,
  InformationIcon,
  InformationList,
  InformationTitle,
  LandingRoot,
  ManagementActionContent,
  ManagementActionDescription,
  ManagementActionItem,
  ManagementActionList,
  ManagementActionTitle,
  PageTitle,
  ShortcutButton,
  ShortcutLabel,
} from "./userManagement.styles";

export type UserManagementAction = "list" | "register" | "delete";

export interface UserManagementHomeProps {
  onSelect: (action: UserManagementAction) => void;
}

const managementActions = [
  {
    id: "list",
    title: "사용자 조회",
    description: "업무 담당자 목록을 조회합니다.",
    shortcutLabel: "목록 조회",
  },
  {
    id: "register",
    title: "사용자 등록",
    description: "업무 담당자를 등록합니다.",
    shortcutLabel: "등록",
  },
  {
    id: "delete",
    title: "사용자 삭제",
    description: "업무 담당자를 삭제합니다.",
    shortcutLabel: "삭제",
  },
] as const satisfies readonly {
  id: UserManagementAction;
  title: string;
  description: string;
  shortcutLabel: string;
}[];

function UserManagementHome({ onSelect }: UserManagementHomeProps) {
  const titleId = useId();
  const informationTitleId = useId();

  return (
    <LandingRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>사용자 관리</PageTitle>

      <ManagementActionList>
        {managementActions.map((action) => (
          <ManagementActionItem key={action.id}>
            <ManagementActionContent>
              <ManagementActionTitle>{action.title}</ManagementActionTitle>
              <ManagementActionDescription>
                {action.description}
              </ManagementActionDescription>
            </ManagementActionContent>

            <ShortcutButton
              variant="tertiary"
              size="large"
              type="button"
              aria-label={`${action.shortcutLabel} 바로가기`}
              onClick={() => onSelect(action.id)}
            >
              <ShortcutLabel>
                <strong>{action.shortcutLabel}</strong> 바로가기
              </ShortcutLabel>
              <ArrowIcon aria-hidden="true" />
            </ShortcutButton>
          </ManagementActionItem>
        ))}
      </ManagementActionList>

      <InformationBox aria-labelledby={informationTitleId}>
        <InformationHeader>
          <InformationIcon aria-hidden="true">i</InformationIcon>
          <InformationTitle id={informationTitleId}>
            데이터 등록 안내
          </InformationTitle>
        </InformationHeader>
        <InformationList type="hollow">
          <li>
            등록 대상자의 인적사항이 일치하는지 확인하여 주시기 바랍니다.
          </li>
          <li>
            등록 완료 전 입력 내용을 다시 한번 확인하여 주시기 바랍니다.
          </li>
        </InformationList>
      </InformationBox>
    </LandingRoot>
  );
}

export default UserManagementHome;
