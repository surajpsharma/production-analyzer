import Header from "@/components/common/Header";
import PageContainer from "@/components/common/PageContainer";
import AnalyzerForm from "@/components/analyzer/AnalyzerForm";

export default function ShellingPage() {
  return (
    <>
      <Header />

      <PageContainer>
        <AnalyzerForm
          title="Shelling Missing Analyzer"
          dashboardLabel="Shelling Dashboard Excel"
          apiEndpoint="/api/shelling"
          buttonText="Analyze Shelling"
        />
      </PageContainer>
    </>
  );
}