import { useId } from "react";
import { Checkbox, TextList } from "krds-react";
import guideCheckIcon from "../assets/guide_check.svg";
import {
  ConfirmPanel,
  GuideIcon,
  IntroCard,
  IntroDescription,
  IntroHeading,
  NoticeHeading,
  NoticeListFrame,
  NoticeSection,
  WarningText,
} from "../career-certificate/steps/NoticeStep.styles";

interface CareerEditNoticeStepProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

function CareerEditNoticeStep({
  accepted,
  onAcceptedChange,
}: CareerEditNoticeStepProps) {
  const agreementId = useId();

  return (
    <>
      <IntroCard>
        <IntroHeading>
          <GuideIcon src={guideCheckIcon} alt="" aria-hidden="true" />
          시작하기 전에
        </IntroHeading>
        <IntroDescription>
          {
            "정확한 인사기록 관리를 위해 경력사항 수정 내역은 모두 시스템에 기록됩니다.\n수정 대상자와 변경할 정보를 확인한 뒤 사실에 근거하여 정확하게 수정해 주시기 바랍니다."
          }
        </IntroDescription>
      </IntroCard>

      <NoticeSection aria-labelledby="career-edit-notice-title">
        <NoticeHeading id="career-edit-notice-title">
          다음 사항을 유의하여 주시기 바랍니다.
        </NoticeHeading>
        <NoticeListFrame>
          <TextList type="decimal">
            <li>수정 대상자의 인적사항이 일치하는지 확인해 주세요.</li>
            <li>변경 전 경력사항과 수정 근거 자료를 먼저 확인해 주세요.</li>
            <li>수정 사유와 변경 내용을 정확하게 입력해 주세요.</li>
            <li>
              저장하기 전에 수정할 항목과 입력 내용을 다시 한번 확인해 주세요.
            </li>
          </TextList>
        </NoticeListFrame>
        <WarningText>
          ※ 확인되지 않은 정보는 수정하지 마시기 바랍니다.
        </WarningText>
      </NoticeSection>

      <ConfirmPanel>
        <Checkbox
          id={agreementId}
          checked={accepted}
          aria-label="위 유의 사항을 읽고 이해하였습니다."
          onChange={(event) => onAcceptedChange(event.target.checked)}
        >
          위 유의 사항을 읽고 이해하였습니다.
        </Checkbox>
      </ConfirmPanel>
    </>
  );
}

export default CareerEditNoticeStep;
