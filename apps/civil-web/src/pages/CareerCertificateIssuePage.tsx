import {
  CareerCertificateIssue,
  useAuthSession,
  type CareerCertificateApplicationData,
  type IssuedCertificateSummary,
  type RestoredIssuedCertificate,
} from "@commonly/ui";
import {
  clearIssuedCertificateSession,
  downloadCertificate,
  fetchCertificateDetail,
  getAuthToken,
  getIssuedCertificateSession,
  issueSelfCertificate,
  saveBlobAsFile,
  setIssuedCertificateSession,
} from "@commonly/utils";
import { useRef } from "react";

interface IssuedCertificateRef {
  certificateId: number;
  documentNo: string;
}

function CareerCertificateIssuePage() {
  const { session } = useAuthSession();
  const issuedRef = useRef<IssuedCertificateRef | null>(null);

  const handleComplete = async (
    data: CareerCertificateApplicationData,
  ): Promise<IssuedCertificateSummary> => {
    // 발급 대상 경력은 서버가 로그인 토큰으로 정한다(명세상 본인 전체 경력).
    const issued = await issueSelfCertificate(
      {
        purpose: data.purpose,
        otherMatters: data.additionalNote,
      },
      { token: getAuthToken() },
    );

    issuedRef.current = {
      certificateId: issued.certificateId,
      documentNo: issued.documentNo,
    };
    // 새로고침해도 방금 발급한 증명서를 다시 내려받을 수 있게 보관한다.
    setIssuedCertificateSession({
      certificateId: issued.certificateId,
      issueType: data.issueType,
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
          applicantName: detail.human?.name ?? session?.name ?? "",
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
    const namePart = session?.name ? `_${session.name}` : "";

    saveBlobAsFile(
      blob,
      `유성구청${namePart}_경력증명서_${issued.documentNo}.pdf`,
    );
  };

  return (
    <CareerCertificateIssue
      variant="civil"
      applicantName={session?.name ?? ""}
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
