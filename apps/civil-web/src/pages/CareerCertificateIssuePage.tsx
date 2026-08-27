import {
  CareerCertificateIssue,
  type CareerCertificateApplicationData,
} from "@commonly/ui";
import {
  downloadCertificate,
  getAuthToken,
  issueSelfCertificate,
  saveBlobAsFile,
  type IssuedCertificate,
} from "@commonly/utils";
import { useRef } from "react";

function CareerCertificateIssuePage() {
  const issuedRef = useRef<IssuedCertificate | null>(null);

  // 본인 발급은 로그인 토큰으로 대상이 정해지므로 용도·기타사항만 전송한다.
  const handleComplete = async (data: CareerCertificateApplicationData) => {
    issuedRef.current = await issueSelfCertificate(
      { purpose: data.purpose, otherMatters: data.additionalNote },
      { token: getAuthToken() },
    );
  };

  const handleDownload = async () => {
    const issued = issuedRef.current;

    if (!issued) {
      throw new Error("발급된 증명서 정보를 찾을 수 없습니다. 다시 발급해 주세요.");
    }

    const blob = await downloadCertificate(issued.certificateId, {
      token: getAuthToken(),
    });

    saveBlobAsFile(blob, `유성구청_경력증명서_${issued.documentNo}.pdf`);
  };

  return (
    <CareerCertificateIssue
      variant="civil"
      onComplete={handleComplete}
      onDownload={handleDownload}
    />
  );
}

export default CareerCertificateIssuePage;
