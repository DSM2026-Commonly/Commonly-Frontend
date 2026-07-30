import "krds-react/dist/index.css";

import type { FormEvent } from "react";
import { useId, useState } from "react";
import { Button, Radio, Table, TextInput } from "krds-react";
import {
  FieldStack,
  FormSectionTitle,
  PageActionButton,
  PageActionRow,
  PageTitle,
  ResultCard,
  SearchButtonRow,
  SearchCard,
  SearchStatus,
  SubmissionError,
  TableFrame,
  WorkflowRoot,
} from "./userManagement.styles";

export interface UserAccountRecord {
  id: string;
  name: string;
  accountId: string;
  department: string;
}

export interface UserDeletionProps {
  initialAccountId?: string;
  onSearch?: (
    accountId: string,
  ) => UserAccountRecord | null | Promise<UserAccountRecord | null>;
  onPrevious?: () => void;
  onDelete: (account: UserAccountRecord) => void | Promise<void>;
}

const defaultAccount: UserAccountRecord = {
  id: "jeon-jaejun",
  name: "전재준",
  accountId: "클로리1234",
  department: "대전광역시 유성구 가정북로 76",
};

function UserDeletion({
  initialAccountId = "",
  onSearch,
  onPrevious,
  onDelete,
}: UserDeletionProps) {
  const titleId = useId();
  const accountIdInputId = useId();
  const [accountId, setAccountId] = useState(initialAccountId);
  const [searchResult, setSearchResult] = useState<UserAccountRecord | null>(
    null,
  );
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [deletionError, setDeletionError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const resetSearchResult = () => {
    setSearchResult(null);
    setSelectedAccountId("");
    setHasSearched(false);
    setSearchError("");
    setDeletionError("");
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAccountId = accountId.trim();

    if (!normalizedAccountId) {
      setSearchError("조회할 아이디를 입력해 주세요.");
      setSearchResult(null);
      setSelectedAccountId("");
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setDeletionError("");

    try {
      const result = onSearch
        ? await onSearch(normalizedAccountId)
        : { ...defaultAccount, accountId: normalizedAccountId };

      setSearchResult(result);
      setSelectedAccountId(result?.id ?? "");
      setHasSearched(true);
    } catch (error) {
      setSearchResult(null);
      setSelectedAccountId("");
      setHasSearched(true);
      setSearchError(
        error instanceof Error
          ? error.message
          : "사용자 조회 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async () => {
    if (!searchResult || selectedAccountId !== searchResult.id) {
      return;
    }

    setIsDeleting(true);
    setDeletionError("");

    try {
      await onDelete(searchResult);
    } catch (error) {
      setDeletionError(
        error instanceof Error
          ? error.message
          : "사용자 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <WorkflowRoot aria-labelledby={titleId}>
      <PageTitle id={titleId}>사용자 삭제</PageTitle>

      <SearchCard noValidate onSubmit={(event) => void handleSearch(event)}>
        <FormSectionTitle>사용자 삭제</FormSectionTitle>
        <FieldStack>
          <TextInput
            id={accountIdInputId}
            name="accountId"
            label="아이디"
            placeholder="아이디를 입력해주세요"
            value={accountId}
            error={searchError || undefined}
            autoComplete="username"
            onChange={(value) => {
              setAccountId(value);
              resetSearchResult();
            }}
          />
        </FieldStack>
        <SearchButtonRow>
          <Button
            variant="secondary"
            size="large"
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? "조회 중..." : "사용자 조회"}
          </Button>
        </SearchButtonRow>
      </SearchCard>

      {hasSearched && (
        <ResultCard aria-labelledby="user-deletion-result-title">
          <FormSectionTitle id="user-deletion-result-title">
            사용자 선택
          </FormSectionTitle>

          {searchResult ? (
            <TableFrame>
              <Table>
                <Table.Caption className="sr-only">
                  삭제할 사용자 조회 결과
                </Table.Caption>
                <Table.Colgroup>
                  <Table.Col width="80px" />
                  <Table.Col width="110px" />
                  <Table.Col width="170px" />
                  <Table.Col />
                </Table.Colgroup>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">선택</Table.Th>
                    <Table.Th scope="col">이름</Table.Th>
                    <Table.Th scope="col">아이디</Table.Th>
                    <Table.Th scope="col">소속 부서</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Radio
                        id={`delete-account-${searchResult.id}`}
                        name="delete-account"
                        value={searchResult.id}
                        checked={selectedAccountId === searchResult.id}
                        onChange={() => setSelectedAccountId(searchResult.id)}
                      >
                        <span className="sr-only">
                          {searchResult.name} 선택
                        </span>
                      </Radio>
                    </Table.Td>
                    <Table.Td>{searchResult.name}</Table.Td>
                    <Table.Td>{searchResult.accountId}</Table.Td>
                    <Table.Td>{searchResult.department}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </TableFrame>
          ) : (
            <SearchStatus role="status">
              입력한 아이디와 일치하는 사용자가 없습니다.
            </SearchStatus>
          )}
        </ResultCard>
      )}

      {deletionError && (
        <SubmissionError role="alert">{deletionError}</SubmissionError>
      )}

      <PageActionRow>
        <PageActionButton
          variant="tertiary"
          size="xlarge"
          type="button"
          onClick={onPrevious}
        >
          이전으로
        </PageActionButton>
        <PageActionButton
          variant="primary"
          size="xlarge"
          type="button"
          disabled={
            !searchResult ||
            selectedAccountId !== searchResult.id ||
            isDeleting
          }
          onClick={() => void handleDelete()}
        >
          {isDeleting ? "삭제 중..." : "삭제하기"}
        </PageActionButton>
      </PageActionRow>
    </WorkflowRoot>
  );
}

export default UserDeletion;
