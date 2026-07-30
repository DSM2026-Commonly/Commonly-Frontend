import { Checkbox, TextList } from "krds-react";
import guideCheckIcon from "../../assets/guide_check.svg";
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
} from "./NoticeStep.styles";

interface NoticeStepProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

function NoticeStep({ accepted, onAcceptedChange }: NoticeStepProps) {
  return (
    <>
      <IntroCard>
        <IntroHeading>
          <GuideIcon src={guideCheckIcon} alt="" aria-hidden="true" />
          시작하기 전에
        </IntroHeading>
        <IntroDescription>
          {"무분별한 발급을 방지하기 위해 발급 내역은 모두 시스템에 기록됩니다.\n민원인의 요청이 있거나 업무상 필요할 경우에 한하여 발급해 주시기 바랍니다."}
        </IntroDescription>
      </IntroCard>

      <NoticeSection>
        <NoticeHeading>
          다음의 경우에만 경력증명서를 발급할 수 있습니다.
        </NoticeHeading>
        <NoticeListFrame>
          <TextList type="decimal">
            <li>민원인이 직접 경력증명서 발급을 요청한 경우</li>
            <li>
              관련 법령, 행정 절차 또는 내부 업무 수행을 위해 발급이 필요한
              경우
            </li>
            <li>기타 업무상 정당한 사유가 있는 경우</li>
          </TextList>
        </NoticeListFrame>
        <WarningText>
          ※ 위 사항에 해당하지 않는 경우에는 경력증명서를 발급해서는 안
          됩니다.
        </WarningText>
      </NoticeSection>

      <ConfirmPanel>
        <Checkbox
          id="career-certificate-notice"
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

export default NoticeStep;
