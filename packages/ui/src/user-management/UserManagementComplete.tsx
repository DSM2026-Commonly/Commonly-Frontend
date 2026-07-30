import "krds-react/dist/index.css";

import { useId } from "react";
import {
  PageActionButton,
  SuccessActions,
  SuccessRoot,
  SuccessTitle,
} from "./userManagement.styles";

export type UserManagementCompletionAction = "register" | "delete";

export interface UserManagementCompleteProps {
  action: UserManagementCompletionAction;
  continueLabel?: string;
  homeLabel?: string;
  onContinue?: () => void;
  onHome?: () => void;
}

const actionTitles = {
  register: "사용자 등록",
  delete: "사용자 삭제",
} as const satisfies Record<UserManagementCompletionAction, string>;

const defaultContinueLabels = {
  register: "추가 등록하기",
  delete: "추가 삭제하기",
} as const satisfies Record<UserManagementCompletionAction, string>;

function UserManagementComplete({
  action,
  continueLabel = defaultContinueLabels[action],
  homeLabel = "홈으로 돌아가기",
  onContinue,
  onHome,
}: UserManagementCompleteProps) {
  const titleId = useId();

  return (
    <SuccessRoot aria-labelledby={titleId}>
      <SuccessTitle id={titleId}>
        {actionTitles[action]}
        <br />
        업무 처리가 <strong>완료</strong>되었습니다.
      </SuccessTitle>

      <SuccessActions>
        <PageActionButton
          variant="secondary"
          size="xlarge"
          type="button"
          onClick={onContinue}
        >
          {continueLabel}
        </PageActionButton>
        <PageActionButton
          variant="primary"
          size="xlarge"
          type="button"
          onClick={onHome}
        >
          {homeLabel}
        </PageActionButton>
      </SuccessActions>
    </SuccessRoot>
  );
}

export default UserManagementComplete;
