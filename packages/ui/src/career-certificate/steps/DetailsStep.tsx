import { Checkbox, Radio, RadioGroup, Table, TextInput } from "krds-react";
import {
  CardStack,
  CardSubheading,
  CardTitle,
  ExtraFields,
  Fieldset,
  FormCard,
  RadioSection,
  SelectionCount,
  SelectionIntro,
  SelectAllButton,
  SelectionToolbar,
  TableFrame,
} from "./DetailsStep.styles";
import type {
  CertificateCareerRow,
  CertificateIssueType,
} from "../CareerCertificateIssue.types";

interface DetailsStepProps {
  variant?: "staff" | "civil";
  issueType: CertificateIssueType;
  careerRows?: readonly CertificateCareerRow[];
  selectedCareerIds: string[];
  isLoadingCareerRows?: boolean;
  additionalNote: string;
  purpose: string;
  onIssueTypeChange: (issueType: CertificateIssueType) => void;
  onCareerSelection: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAdditionalNoteChange: (value: string) => void;
  onPurposeChange: (value: string) => void;
}

interface CertificateExtraFieldsProps {
  idPrefix: string;
  showAdditionalNote?: boolean;
  additionalNote: string;
  purpose: string;
  onAdditionalNoteChange: (value: string) => void;
  onPurposeChange: (value: string) => void;
}

function CertificateExtraFields({
  idPrefix,
  showAdditionalNote = true,
  additionalNote,
  purpose,
  onAdditionalNoteChange,
  onPurposeChange,
}: CertificateExtraFieldsProps) {
  return (
    <ExtraFields>
      {showAdditionalNote && (
        <TextInput
          id={`${idPrefix}-additional-note`}
          label="그 밖의 사항"
          placeholder="추가 기입 사항을 입력해주세요"
          value={additionalNote}
          onChange={onAdditionalNoteChange}
        />
      )}
      <TextInput
        id={`${idPrefix}-purpose`}
        label="용도"
        placeholder="용도를 입력해주세요"
        value={purpose}
        onChange={onPurposeChange}
      />
    </ExtraFields>
  );
}

function DetailsStep({
  variant = "staff",
  issueType,
  careerRows = [],
  selectedCareerIds,
  isLoadingCareerRows = false,
  additionalNote,
  purpose,
  onIssueTypeChange,
  onCareerSelection,
  onSelectAll,
  onAdditionalNoteChange,
  onPurposeChange,
}: DetailsStepProps) {
  const allCareersSelected =
    careerRows.length > 0 && selectedCareerIds.length === careerRows.length;
  const isCivil = variant === "civil";

  return (
    <CardStack>
      <FormCard>
        <Fieldset>
          <legend className="sr-only">발급유형 선택</legend>
          <CardTitle>발급유형 선택</CardTitle>
          <RadioSection>
            <RadioGroup
              name="certificate-issue-type"
              value={issueType}
              onChange={(value) =>
                onIssueTypeChange(value as CertificateIssueType)
              }
              column
            >
              <Radio id="certificate-issue-all" value="all">
                전체 발급
              </Radio>
              <Radio id="certificate-issue-selected" value="selected">
                선택 발급
              </Radio>
            </RadioGroup>
          </RadioSection>
        </Fieldset>
      </FormCard>

      {issueType === "selected" ? (
        <FormCard>
          <CardTitle>내역 선택</CardTitle>
          <SelectionIntro>
            <CardSubheading>포함할 내역</CardSubheading>
            <SelectionToolbar>
              <SelectionCount aria-live="polite">
                {careerRows.length}건 중{" "}
                <strong>{selectedCareerIds.length}건</strong> 선택됨
              </SelectionCount>
              {isCivil && (
                <SelectAllButton
                  type="button"
                  onClick={() => onSelectAll(!allCareersSelected)}
                >
                  {allCareersSelected ? "전체 해제" : "전체 선택"}
                </SelectAllButton>
              )}
            </SelectionToolbar>
          </SelectionIntro>
          <TableFrame>
            <Table>
              <Table.Caption className="sr-only">
                경력증명서에 포함할 경력 내역
              </Table.Caption>
              <Table.Colgroup>
                <Table.Col width="80px" />
                <Table.Col width="231px" />
                <Table.Col width="170px" />
                <Table.Col width="231px" />
              </Table.Colgroup>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col">
                    <Checkbox
                      id="certificate-career-all"
                      checked={allCareersSelected}
                      aria-label="경력 내역 전체 선택"
                      onChange={(event) =>
                        onSelectAll(event.target.checked)
                      }
                    />
                  </Table.Th>
                  <Table.Th scope="col">담당업무</Table.Th>
                  <Table.Th scope="col">근무부서</Table.Th>
                  <Table.Th scope="col">근무 기간</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {careerRows.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} align="center">
                      {isLoadingCareerRows
                        ? "경력 사항을 불러오는 중입니다..."
                        : "조회된 경력 사항이 없습니다."}
                    </Table.Td>
                  </Table.Tr>
                )}
                {careerRows.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>
                      <Checkbox
                        id={`certificate-${row.id}`}
                        checked={selectedCareerIds.includes(row.id)}
                        aria-label={`${row.job} 선택`}
                        onChange={(event) =>
                          onCareerSelection(row.id, event.target.checked)
                        }
                      />
                    </Table.Td>
                    <Table.Td>{row.job}</Table.Td>
                    <Table.Td>{row.department}</Table.Td>
                    <Table.Td>{row.period}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </TableFrame>
          <CertificateExtraFields
            idPrefix="certificate"
            showAdditionalNote={!isCivil}
            additionalNote={additionalNote}
            purpose={purpose}
            onAdditionalNoteChange={onAdditionalNoteChange}
            onPurposeChange={onPurposeChange}
          />
        </FormCard>
      ) : !isCivil ? (
        <FormCard>
          <CardTitle>비고</CardTitle>
          <CertificateExtraFields
            idPrefix="certificate-all"
            additionalNote={additionalNote}
            purpose={purpose}
            onAdditionalNoteChange={onAdditionalNoteChange}
            onPurposeChange={onPurposeChange}
          />
        </FormCard>
      ) : (
        // 민원인 전체 발급: 용도는 필수 입력이므로 여기서도 입력란을 보여준다.
        <FormCard>
          <CardTitle>용도</CardTitle>
          <CertificateExtraFields
            idPrefix="certificate-all"
            showAdditionalNote={false}
            additionalNote={additionalNote}
            purpose={purpose}
            onAdditionalNoteChange={onAdditionalNoteChange}
            onPurposeChange={onPurposeChange}
          />
        </FormCard>
      )}
    </CardStack>
  );
}

export default DetailsStep;
