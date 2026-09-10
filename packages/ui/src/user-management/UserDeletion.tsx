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
  initialName?: string;
  onSearch?: (
    name: string,
  ) => readonly UserAccountRecord[] | Promise<readonly UserAccountRecord[]>;
  onPrevious?: () => void;
  onDelete: (account: UserAccountRecord) => void | Promise<void>;
}

function UserDeletion({
  initialName = "",
  onSearch,
  onPrevious,
  onDelete,
}: UserDeletionProps) {
  const titleId = useId();
  const nameInputId = useId();
  const [name, setName] = useState(initialName);
  const [searchResults, setSearchResults] = useState<
    readonly UserAccountRecord[]
  >([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [deletionError, setDeletionError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedAccount =
    searchResults.find((account) => account.id === selectedAccountId) ?? null;

  const resetSearchResult = () => {
    setSearchResults([]);
    setSelectedAccountId("");
    setHasSearched(false);
    setSearchError("");
    setDeletionError("");
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setSearchError("조회할 이름을 입력해주세요.");
      setSearchResults([]);
      setSelectedAccountId("");
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setDeletionError("");

    try {
      // onSearch 가 없으면 조회할 수단이 없으므로 빈 결과로 둔다.
      const results = onSearch ? await onSearch(normalizedName) : [];

      setSearchResults(results);
      setSelectedAccountId(results.length === 1 ? results[0].id : "");
      setHasSearched(true);
    } catch (error) {
      setSearchResults([]);
      setSelectedAccountId("");
      setHasSearched(false);
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
    if (!selectedAccount) {
      return;
    }

    if (
      !window.confirm(
        `${selectedAccount.name}(${selectedAccount.accountId}) 사용자를 삭제하시겠습니까?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeletionError("");

    try {
      await onDelete(selectedAccount);
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
            id={nameInputId}
            name="name"
            label="이름"
            placeholder="이름을 입력해주세요"
            value={name}
            error={searchError || undefined}
            autoComplete="off"
            onChange={(value) => {
              setName(value);
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

          {searchResults.length > 0 ? (
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
                  {searchResults.map((account) => (
                    <Table.Tr key={account.id}>
                      <Table.Td>
                        <Radio
                          id={`delete-account-${account.id}`}
                          name="delete-account"
                          value={account.id}
                          checked={selectedAccountId === account.id}
                          onChange={() => setSelectedAccountId(account.id)}
                        >
                          <span className="sr-only">
                            {account.name}({account.accountId}) 선택
                          </span>
                        </Radio>
                      </Table.Td>
                      <Table.Td>{account.name}</Table.Td>
                      <Table.Td>{account.accountId}</Table.Td>
                      <Table.Td>{account.department}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </TableFrame>
          ) : (
            <SearchStatus role="status">
              입력한 이름과 일치하는 사용자가 없습니다.
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
          disabled={!selectedAccount || isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? "삭제 중..." : "삭제하기"}
        </PageActionButton>
      </PageActionRow>
    </WorkflowRoot>
  );
}

export default UserDeletion;
