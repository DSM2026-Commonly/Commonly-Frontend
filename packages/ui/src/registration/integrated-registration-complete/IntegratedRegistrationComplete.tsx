import "krds-react/dist/index.css";

import { useId } from "react";
import { Table } from "krds-react";
import {
  ActionButton,
  ActionGroup,
  CompleteRoot,
  CompleteTitle,
  DetailSection,
  FailureNote,
  FailureSection,
  FailureTableFrame,
  FailureTitle,
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

export interface IntegratedRegistrationCompleteFailure {
  /** 엑셀 파일 기준 행 번호 */
  rowIndex: number;
  reason: string;
}

export interface IntegratedRegistrationCompleteProps {
  title?: string;
  results: readonly IntegratedRegistrationCompleteResult[];
  /** 등록에 실패한 행 목록. 비어 있으면 실패 상세를 표시하지 않는다. */
  failures?: readonly IntegratedRegistrationCompleteFailure[];
  addLabel?: string;
  homeLabel?: string;
  onAdd?: () => void;
  onHome?: () => void;
}

function IntegratedRegistrationComplete({
  title,
  results,
  failures = [],
  addLabel = "추가 등록하기",
  homeLabel = "홈으로 돌아가기",
  onAdd,
  onHome,
}: IntegratedRegistrationCompleteProps) {
  const titleId = useId();
  const failureTitleId = `${titleId}-failures`;

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

        {failures.length > 0 && (
          <FailureSection aria-labelledby={failureTitleId}>
            <FailureTitle id={failureTitleId}>실패 상세</FailureTitle>
            <FailureNote>
              아래 행은 등록되지 않았습니다. 파일에서 해당 행을 수정한 뒤 다시
              업로드해 주세요.
            </FailureNote>
            <FailureTableFrame>
              <Table>
                <Table.Caption className="sr-only">
                  등록에 실패한 행과 실패 사유
                </Table.Caption>
                <Table.Colgroup>
                  <Table.Col width="120px" />
                  <Table.Col />
                </Table.Colgroup>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">행 번호</Table.Th>
                    <Table.Th scope="col">실패 사유</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {failures.map((failure, index) => (
                    <Table.Tr key={`${failure.rowIndex}-${index}`}>
                      <Table.Td>{`${failure.rowIndex}행`}</Table.Td>
                      <Table.Td>{failure.reason}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </FailureTableFrame>
          </FailureSection>
        )}

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
