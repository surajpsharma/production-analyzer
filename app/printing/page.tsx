import Header from "@/components/common/Header";
import PageContainer from "@/components/common/PageContainer";
import AnalyzerForm from "@/components/analyzer/AnalyzerForm";

export default function PrintingPage() {
  return (
    <>
      <Header />

      <PageContainer>
        <AnalyzerForm
          title="Printing Missing Analyzer"
          dashboardLabel="Printing Dashboard Excel"
          apiEndpoint="/api/printing"
          buttonText="Analyze Printing"
        />
      </PageContainer>
    </>
  );
}