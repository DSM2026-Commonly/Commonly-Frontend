import { Radio, RadioGroup, Textarea } from "krds-react";
import { REASON_OPTIONS } from "../CareerCertificateIssue.constants";
import {
  CardSubheading,
  Fieldset,
  FormCard,
  RadioSection,
  TextareaFrame,
} from "./ReasonStep.styles";

interface ReasonStepProps {
  reason: string;
  note: string;
  onReasonChange: (reason: string) => void;
  onNoteChange: (note: string) => void;
}

function ReasonStep({
  reason,
  note,
  onReasonChange,
  onNoteChange,
}: ReasonStepProps) {
  return (
    <FormCard>
      <Fieldset>
        <legend className="sr-only">발급 사유 입력</legend>
        <CardSubheading>발급 사유 입력</CardSubheading>
        <RadioSection>
          <RadioGroup
            name="certificate-reason"
            value={reason}
            onChange={onReasonChange}
            column
          >
            {REASON_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                id={`certificate-reason-${option.value}`}
                value={option.value}
              >
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        </RadioSection>
      </Fieldset>

      <TextareaFrame>
        <Textarea
          placeholder="상세 내용을 입력하세요"
          value={note}
          onChange={onNoteChange}
          maxLength={100}
          showCount
        />
      </TextareaFrame>
    </FormCard>
  );
}

export default ReasonStep;
