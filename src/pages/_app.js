import "../Scss/index.css";
import "@/components/Header/header.css";
import "../components/Footer/footer.css";
import "../components/AdminPanelHeader/admin_panel_header.css";
import "../components/ErrorOnLoadingThePage/error_on_loading_the_page.css";
import "../pages/login/login.css";
import "./products-managment/update-and-delete-products/update_and_delete_products.css";
import "../pages/orders-managment/billing/[orderId]/billing.css";
import "../../config/i18n";

export default function App({ Component, pageProps }) {
  return (
    <Component {...pageProps} />
  );
}