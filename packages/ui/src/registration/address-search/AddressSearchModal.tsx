import { Button, Modal, TextInput } from "krds-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  AddressList,
  AddressListItem,
  AddressMeta,
  AddressPrimary,
  AddressSecondary,
  EmptyMessage,
  PagerRow,
  SearchForm,
  SearchGuide,
  SearchStatus,
} from "./addressSearchModal.styles";

export interface AddressSearchItem {
  id: string;
  roadAddress: string;
  jibunAddress: string;
  zipCode: string;
}

export interface AddressSearchResult {
  totalCount: number;
  addresses: readonly AddressSearchItem[];
}

export interface AddressSearchQuery {
  keyword: string;
  page: number;
  size: number;
}

export interface AddressSearchModalProps {
  open: boolean;
  pageSize?: number;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: AddressSearchQuery) => Promise<AddressSearchResult>;
  onSelect: (address: AddressSearchItem) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const UNEXPECTED_ERROR_MESSAGE =
  "주소 검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : UNEXPECTED_ERROR_MESSAGE;
}

/** 도로명주소 검색 모달. 검색·페이지 이동은 onSearch 로 위임하고 선택 결과만 돌려준다. */
function AddressSearchModal({
  open,
  pageSize = DEFAULT_PAGE_SIZE,
  onOpenChange,
  onSearch,
  onSelect,
}: AddressSearchModalProps) {
  const inputId = useId();
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AddressSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // 입력이 바뀐 뒤 도착하는 이전 응답을 무시하기 위한 요청 id.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (open) {
      return;
    }

    requestIdRef.current += 1;
    setKeyword("");
    setSubmittedKeyword("");
    setPage(1);
    setResult(null);
    setIsSearching(false);
    setErrorMessage("");
  }, [open]);

  const runSearch = async (nextKeyword: string, nextPage: number) => {
    const normalizedKeyword = nextKeyword.trim();

    if (!normalizedKeyword) {
      setErrorMessage("검색어를 입력해 주세요.");
      return;
    }

    const requestId = ++requestIdRef.current;

    setIsSearching(true);
    setErrorMessage("");

    try {
      const nextResult = await onSearch({
        keyword: normalizedKeyword,
        page: nextPage,
        size: pageSize,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setSubmittedKeyword(normalizedKeyword);
      setPage(nextPage);
      setResult(nextResult);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setResult(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(keyword, 1);
  };

  const totalPages = result
    ? Math.max(1, Math.ceil(result.totalCount / pageSize))
    : 1;

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="md">
      <Modal.Content aria-label="주소 검색">
        <Modal.Header title="주소 검색" />
        <Modal.Body>
          <SearchForm onSubmit={handleSubmit}>
            <TextInput
              id={inputId}
              label="도로명, 건물명 또는 지번"
              size="large"
              placeholder="예) 대학로 211, 유성구청"
              value={keyword}
              onChange={setKeyword}
            />
            <Button
              type="submit"
              size="large"
              disabled={isSearching || !keyword.trim()}
            >
              {isSearching ? "검색 중" : "검색"}
            </Button>
          </SearchForm>
          <SearchGuide>
            도로명(예: 대학로 211), 건물명(예: 유성구청), 지번(예: 어은동 4)
            으로 검색할 수 있습니다.
          </SearchGuide>
          {errorMessage && <SearchStatus role="alert">{errorMessage}</SearchStatus>}
          {result && (
            <>
              <SearchStatus aria-live="polite">
                &ldquo;{submittedKeyword}&rdquo; 검색 결과{" "}
                <strong>{result.totalCount.toLocaleString()}건</strong>
              </SearchStatus>
              {result.addresses.length === 0 ? (
                <EmptyMessage>
                  검색 결과가 없습니다. 검색어를 다시 확인해 주세요.
                </EmptyMessage>
              ) : (
                <AddressList>
                  {result.addresses.map((address) => (
                    <AddressListItem key={address.id}>
                      <button type="button" onClick={() => onSelect(address)}>
                        <AddressPrimary>{address.roadAddress}</AddressPrimary>
                        <AddressSecondary>
                          {address.jibunAddress && (
                            <AddressMeta>
                              <span>지번</span> {address.jibunAddress}
                            </AddressMeta>
                          )}
                          {address.zipCode && (
                            <AddressMeta>
                              <span>우편번호</span> {address.zipCode}
                            </AddressMeta>
                          )}
                        </AddressSecondary>
                      </button>
                    </AddressListItem>
                  ))}
                </AddressList>
              )}
              {totalPages > 1 && (
                <PagerRow>
                  <Button
                    variant="tertiary"
                    size="medium"
                    disabled={isSearching || page <= 1}
                    onClick={() => void runSearch(submittedKeyword, page - 1)}
                  >
                    이전
                  </Button>
                  <span aria-live="polite">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="tertiary"
                    size="medium"
                    disabled={isSearching || page >= totalPages}
                    onClick={() => void runSearch(submittedKeyword, page + 1)}
                  >
                    다음
                  </Button>
                </PagerRow>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="tertiary" size="large">
              닫기
            </Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

export default AddressSearchModal;
