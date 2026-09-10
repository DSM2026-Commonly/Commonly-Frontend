import { searchAddresses } from "@commonly/utils";
import type {
  AddressSearchQuery,
  AddressSearchResult,
} from "./AddressSearchModal";

/** 도로명주소 API(business.juso.go.kr) 검색 결과를 AddressSearchModal 이 쓰는 형태로 맞춘다. */
export async function searchRoadAddresses({
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
