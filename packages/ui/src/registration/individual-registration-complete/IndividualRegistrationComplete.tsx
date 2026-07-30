import "krds-react/dist/index.css";

import { useId } from "react";
import {
  ActionButton,
  ActionGroup,
  CompleteRoot,
  CompleteTitle,
  DetailSection,
  ResultCard,
  ResultLabel,
  ResultRow,
  ResultValue,
} from "./individualRegistrationComplete.styles";

export interface IndividualRegistrationCompleteProps {
  title?: string;
  subjectName?: string;
  duties?: string;
  addLabel?: string;
  homeLabel?: string;
  onAdd?: () => void;
  onHome?: () => void;
}

function IndividualRegistrationComplete({
  title,
  subjectName = "전재준",
  duties = "~~ 업무",
  addLabel = "추가 등록하기",
  homeLabel = "홈으로 돌아가기",
  onAdd,
  onHome,
}: IndividualRegistrationCompleteProps) {
  const titleId = useId();

  return (
    <CompleteRoot aria-labelledby={titleId}>
      <CompleteTitle id={titleId}>
        {title ?? (
          <>
            경력사항 개별 등록
            <br />
            업무 처리가 <strong>완료</strong>되었습니다.
          </>
        )}
      </CompleteTitle>

      <DetailSection>
        <ResultCard aria-label="개별 등록 처리 결과">
          <ResultRow>
            <ResultLabel>대상자</ResultLabel>
            <ResultValue>{subjectName}</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>담당 업무</ResultLabel>
            <ResultValue>{duties}</ResultValue>
          </ResultRow>
        </ResultCard>

        <ActionGroup>
          <ActionButton
            variant="tertiary"
            size="xlarge"
            type="button"
            onClick={onAdd}
          >
            {addLabel}
          </ActionButton>
          <ActionButton
            variant="primary"
            size="xlarge"
            type="button"
            onClick={onHome}
          >
            {homeLabel}
          </ActionButton>
        </ActionGroup>
      </DetailSection>
    </CompleteRoot>
  );
}

export default IndividualRegistrationComplete;
