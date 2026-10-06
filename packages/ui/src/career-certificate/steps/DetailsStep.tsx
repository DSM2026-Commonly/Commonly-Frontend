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
  SelectionLimitNotice,
  SelectAllButton,
  SelectionToolbar,
  TableFrame,
} from "./DetailsStep.styles";
import { MAX_ISSUE_CAREER_COUNT } from "../CareerCertificateIssue.constants";
import { FlowError } from "../CareerCertificateIssue.styles";
import { getMissingCertificateDetailsFields } from "../CareerCertificateIssue.validation";
import { FormHint } from "../../form/requiredFields.styles";
import { getRequiredFieldsMessage } from "../../form/requiredFields.utils";
import type {
  CertificateCareerRow,
  CertificateIssueType,
  OwnCareerLoadStatus,
} from "../CareerCertificateIssue.types";

/**
 * 민원인 본인 경력 목록이 비었을 때의 안내. 조회 결과에 따라 이유가 다르다.
 * 닫힘(401/403)이면 발급도 같은 이유로 막히므로 "전체로 발급된다"고 약속하지 않는다.
 */
const CIVIL_EMPTY_CAREER_MESSAGES: Record<
  Exclude<OwnCareerLoadStatus, "loading">,
  string
> = {
  idle: "현재 온라인으로 본인 경력을 조회할 수 없습니다. 042-611-2114로 문의해 주세요.",
  unavailable:
    "현재 온라인으로 본인 경력을 조회할 수 없습니다. 042-611-2114로 문의해 주세요.",
  failed: "본인 경력 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  loaded: "조회된 본인 경력이 없습니다. 042-611-2114로 문의해 주세요.",
};

interface DetailsStepProps {
  variant?: "staff" | "civil";
  issueType: CertificateIssueType;
  careerRows?: readonly CertificateCareerRow[];
  selectedCareerIds: string[];
  isLoadingCareerRows?: boolean;
  /** 민원인 본인 경력 조회 결과. 목록이 비었을 때 안내 문구를 고른다. */
  ownCareerLoadStatus?: OwnCareerLoadStatus;
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
        aria-required
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
  ownCareerLoadStatus = "idle",
  additionalNote,
  purpose,
  onIssueTypeChange,
  onCareerSelection,
  onSelectAll,
  onAdditionalNoteChange,
  onPurposeChange,
}: DetailsStepProps) {
  // 경력이 10건을 넘으면 "전체 선택"은 앞의 10건까지만 고르므로 그만큼 찼을 때를 전체로 본다.
  const allCareersSelected =
    careerRows.length > 0 &&
    selectedCareerIds.length ===
      Math.min(careerRows.length, MAX_ISSUE_CAREER_COUNT);
  const isCivil = variant === "civil";
  const exceedsIssueLimit = careerRows.length > MAX_ISSUE_CAREER_COUNT;
  const isSelectionFull = selectedCareerIds.length >= MAX_ISSUE_CAREER_COUNT;
  // 신청 버튼이 비활성인 이유 중 아직 입력하지 않은 필수 항목을 버튼 바로 위에서 알린다.
  const requiredFieldsHint = getRequiredFieldsMessage(
    getMissingCertificateDetailsFields(purpose),
  );

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
          {issueType === "all" && exceedsIssueLimit && (
            <FlowError role="alert">
              경력이 {MAX_ISSUE_CAREER_COUNT}건을 넘어 전체 발급할 수 없습니다.
              선택 발급으로 {MAX_ISSUE_CAREER_COUNT}건 이하를 골라주세요.
            </FlowError>
          )}
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
            {exceedsIssueLimit && (
              <SelectionLimitNotice>
                최대 {MAX_ISSUE_CAREER_COUNT}건까지 선택할 수 있습니다.
              </SelectionLimitNotice>
            )}
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
                      {isLoadingCareerRows || ownCareerLoadStatus === "loading"
                        ? "경력 사항을 불러오는 중입니다..."
                        : isCivil
                          ? CIVIL_EMPTY_CAREER_MESSAGES[ownCareerLoadStatus]
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
                        // 10건을 채우면 고르지 않은 행은 더 고를 수 없다.
                        disabled={
                          isSelectionFull && !selectedCareerIds.includes(row.id)
                        }
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
      {requiredFieldsHint && (
        <FormHint role="status">{requiredFieldsHint}</FormHint>
      )}
    </CardStack>
  );
}

export default DetailsStep;
