import {
  CareerCertificateIssue,
  toCareerRow,
  type CareerCertificateApplicationData,
  type CertificateCareerRow,
  type IssuedCertificateSummary,
  type RestoredIssuedCertificate,
} from "@commonly/ui";
import {
  clearIssuedCertificateSession,
  downloadCertificate,
  fetchCertificateDetail,
  fetchMyCertificates,
  getAuthToken,
  getIssuedCertificateSession,
  issueSelfCertificate,
  previewSelfCertificate,
  saveBlobAsFile,
  setIssuedCertificateSession,
} from "@commonly/utils";
import { useRef } from "react";
import { toSelfCertificateRequest } from "./selfCertificateRequest";

interface IssuedCertificateRef {
  certificateId: number;
  documentNo: string;
}

function CareerCertificateIssuePage() {
  const issuedRef = useRef<IssuedCertificateRef | null>(null);

  // 본인 발급이 닫혀 있으면(백엔드 스위치 off) 거부되고, 화면은 빈 목록으로 전체 발급을 진행한다.
  const handleLoadCareerRows = async (): Promise<
    readonly CertificateCareerRow[]
  > => {
    const certificates = await fetchMyCertificates({ token: getAuthToken() });

    return certificates.map(toCareerRow);
  };

  const handlePreview = async (data: CareerCertificateApplicationData) =>
    previewSelfCertificate(toSelfCertificateRequest(data), {
      token: getAuthToken(),
    });

  const handleComplete = async (
    data: CareerCertificateApplicationData,
  ): Promise<IssuedCertificateSummary> => {
    // 대상자는 서버가 로그인 토큰으로 정한다. 고른 경력이 없으면 본인 전체 경력이 발급된다.
    const request = toSelfCertificateRequest(data);
    const issued = await issueSelfCertificate(request, {
      token: getAuthToken(),
    });

    issuedRef.current = {
      certificateId: issued.certificateId,
      documentNo: issued.documentNo,
    };
    // 새로고침해도 방금 발급한 증명서를 다시 내려받을 수 있게 보관한다.
    // 발급 구분은 실제로 보낸 값 기준이다. 고른 경력을 보냈을 때만 선택 발급이다.
    setIssuedCertificateSession({
      certificateId: issued.certificateId,
      issueType: request.certificateIds ? "selected" : "all",
    });

    return {
      documentNo: issued.documentNo,
      issuedAt: await loadIssuedAt(issued.certificateId),
    };
  };

  const handleRestoreIssued =
    async (): Promise<RestoredIssuedCertificate | null> => {
      const storedSession = getIssuedCertificateSession();

      if (!storedSession) {
        return null;
      }

      try {
        const detail = await fetchCertificateDetail(
          storedSession.certificateId,
          { token: getAuthToken() },
        );

        issuedRef.current = {
          certificateId: detail.certificateId,
          documentNo: detail.documentNo,
        };

        return {
          applicantName: detail.human?.name ?? "",
          issueType: storedSession.issueType,
          documentNo: detail.documentNo,
          issuedAt: detail.issuedAt,
        };
      } catch {
        // 삭제됐거나 조회할 수 없는 발급 건이면 보관값을 버리고 처음부터 시작한다.
        clearIssuedCertificateSession();
        return null;
      }
    };

  const handleRestart = () => {
    clearIssuedCertificateSession();
    issuedRef.current = null;
  };

  const handleDownload = async () => {
    const issued = issuedRef.current;

    if (!issued) {
      throw new Error("발급된 증명서 정보를 찾을 수 없습니다. 다시 발급해 주세요.");
    }

    const blob = await downloadCertificate(issued.certificateId, {
      token: getAuthToken(),
    });

    saveBlobAsFile(
      blob,
      `유성구청_경력증명서_${issued.documentNo}.pdf`,
    );
  };

  return (
    <CareerCertificateIssue
      variant="civil"
      // 계정 아이디는 실명이 아니므로 발급 전에는 성명으로 쓰지 않는다.
      applicantName=""
      onLoadCareerRows={handleLoadCareerRows}
      onPreview={handlePreview}
      onComplete={handleComplete}
      onDownload={handleDownload}
      onRestoreIssued={handleRestoreIssued}
      onRestart={handleRestart}
    />
  );
}

/** 발급일은 발급 응답에 없어 상세로 한 번 더 확인한다. 실패해도 발급 자체는 성공이다. */
async function loadIssuedAt(certificateId: number): Promise<string> {
  try {
    const detail = await fetchCertificateDetail(certificateId, {
      token: getAuthToken(),
    });

    return detail.issuedAt;
  } catch {
    return "";
  }
}

export default CareerCertificateIssuePage;
