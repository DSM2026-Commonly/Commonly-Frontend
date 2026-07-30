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
} from "./integratedRegistrationComplete.styles";

export interface IntegratedRegistrationCompleteResult {
  id: string;
  label: string;
  value: string;
}

export interface IntegratedRegistrationCompleteProps {
  title?: string;
  results?: readonly IntegratedRegistrationCompleteResult[];
  addLabel?: string;
  homeLabel?: string;
  onAdd?: () => void;
  onHome?: () => void;
}

const defaultResults = [
  { id: "total", label: "대상 건수", value: "00건" },
  { id: "success", label: "성공 건수", value: "00건" },
  { id: "failure", label: "실패 건수", value: "00건" },
] as const satisfies readonly IntegratedRegistrationCompleteResult[];

function IntegratedRegistrationComplete({
  title,
  results = defaultResults,
  addLabel = "추가 등록하기",
  homeLabel = "홈으로 돌아가기",
  onAdd,
  onHome,
}: IntegratedRegistrationCompleteProps) {
  const titleId = useId();

  return (
    <CompleteRoot aria-labelledby={titleId}>
      <CompleteTitle id={titleId}>
        {title ?? (
          <>
            경력사항 통합 등록
            <br />
            업무 처리가 <strong>완료</strong>되었습니다.
          </>
        )}
      </CompleteTitle>

      <DetailSection>
        <ResultCard aria-label="통합 등록 처리 결과">
          {results.map((result) => (
            <ResultRow key={result.id}>
              <ResultLabel>{result.label}</ResultLabel>
              <ResultValue>{result.value}</ResultValue>
            </ResultRow>
          ))}
        </ResultCard>

        <ActionGroup>
          <ActionButton
            variant="secondary"
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

export default IntegratedRegistrationComplete;
