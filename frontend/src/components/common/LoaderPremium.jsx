export default function LoaderPremium({ mini = false }) {
  return (
    <div className={`thermal-loader ${mini ? "btn-mini" : ""}`}></div>
  );
}
