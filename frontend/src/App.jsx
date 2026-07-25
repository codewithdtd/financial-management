import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm font-medium text-cyan-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Tổng quan tài chính</h1>
      </section>
    </Layout>
  );
}
