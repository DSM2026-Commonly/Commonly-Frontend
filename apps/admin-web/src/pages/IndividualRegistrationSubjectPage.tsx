import {
  IndividualRegistrationSubject,
  type AddressSearchQuery,
  type AddressSearchResult,
  type IndividualRegistrationSubjectData,
} from "@commonly/ui";
import { searchAddresses } from "@commonly/utils";
import { useNavigate } from "react-router";

// 도로명주소 API(business.juso.go.kr) 검색 결과를 UI 모달이 쓰는 형태로 맞춘다.
async function searchRoadAddresses({
  keyword,
  page,
  size,
}: AddressSearchQuery): Promise<AddressSearchResult> {
  const result = await searchAddresses({ keyword, page, size });

  return {
    totalCount: result.totalCount,
    addresses: result.addresses.map((address, index) => ({
      id: address.buildingCode || `${result.page}-${index}-${address.roadAddress}`,
      roadAddress: address.roadAddress,
      jibunAddress: address.jibunAddress,
      zipCode: address.zipCode,
    })),
  };
}

function IndividualRegistrationSubjectPage() {
  const navigate = useNavigate();

  return (
    <IndividualRegistrationSubject
      onSearchAddress={searchRoadAddresses}
      onPrevious={() => void navigate("/career/register/individual")}
      onNext={(subject: IndividualRegistrationSubjectData) =>
        void navigate("/career/register/individual/career", {
          state: { subject },
        })
      }
    />
  );
}

export default IndividualRegistrationSubjectPage;
