import {
  ActionButton,
  ActionLabel,
  ArrowIcon,
  ChoiceContent,
  ChoiceDescription,
  ChoiceDivider,
  ChoiceItem,
  ChoiceList,
  ChoiceTitle,
  InformationBox,
  InformationHeader,
  InformationIcon,
  InformationList,
  InformationListItem,
  InformationTitle,
  PageTitle,
  RegistrationMethodRoot,
} from "./registrationMethodSelector.styles";

export interface RegistrationMethodOption {
  id: string;
  href: string;
  title: string;
  description: string;
}

export interface RegistrationMethodSelectorProps {
  title: string;
  options: readonly [RegistrationMethodOption, RegistrationMethodOption];
  informationTitle: string;
  informationItems: readonly string[];
  onSelect: (option: RegistrationMethodOption) => void;
}

function RegistrationMethodSelector({
  title,
  options,
  informationTitle,
  informationItems,
  onSelect,
}: RegistrationMethodSelectorProps) {
  return (
    <RegistrationMethodRoot aria-labelledby="registration-method-title">
      <PageTitle id="registration-method-title">{title}</PageTitle>

      <ChoiceList>
        {options.map((option, index) => (
          <ChoiceItem key={option.id}>
            <ChoiceContent>
              <ChoiceTitle>{option.title}</ChoiceTitle>
              <ChoiceDescription>{option.description}</ChoiceDescription>
            </ChoiceContent>

            <ActionButton
              variant="tertiary"
              size="large"
              type="button"
              aria-label={`${option.title} 바로가기`}
              onClick={() => onSelect(option)}
            >
              <ActionLabel>
                <strong>{option.title}</strong> 바로가기
              </ActionLabel>
              <ArrowIcon aria-hidden="true" />
            </ActionButton>

            {index === 0 && <ChoiceDivider aria-hidden="true" />}
          </ChoiceItem>
        ))}
      </ChoiceList>

      <InformationBox aria-labelledby="registration-information-title">
        <InformationHeader>
          <InformationIcon aria-hidden="true">i</InformationIcon>
          <InformationTitle id="registration-information-title">
            {informationTitle}
          </InformationTitle>
        </InformationHeader>
        <InformationList type="decimal">
          {informationItems.map((item) => (
            <InformationListItem key={item}>{item}</InformationListItem>
          ))}
        </InformationList>
      </InformationBox>
    </RegistrationMethodRoot>
  );
}

export default RegistrationMethodSelector;
