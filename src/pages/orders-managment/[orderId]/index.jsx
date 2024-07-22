import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo } from "../../../../public/global_functions/popular";

export default function OrderDetails({ orderIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [selectedOrderProductIndex, setSelectedOrderProductIndex] = useState(-1);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [isDeletingStatus, setIsDeletingStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/login");
                        } else {
                            setAdminInfo(adminDetails);
                            result = await getOrderDetails(orderIdAsProperty);
                            if (!result.error) {
                                setOrderDetails(result.data);
                                setIsLoadingPage(false);
                            }
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.replace("/login");
    }, []);

    const getOrderDetails = async (orderId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const changeOrderProductData = (productIndex, fieldName, newValue) => {
        let productsTemp = orderDetails.products;
        productsTemp[productIndex][fieldName] = newValue;
        setOrderDetails({ ...orderDetails, products: productsTemp });
    }

    const updateOrderProductData = async (orderProductIndex) => {
        try {
            setIsUpdatingStatus(true);
            setSelectedOrderProductIndex(orderProductIndex);
            const res = await axios.put(`${process.env.BASE_API_URL}/orders/products/update-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}`, {
                quantity: orderDetails.products[orderProductIndex].quantity,
                name: orderDetails.products[orderProductIndex].name,
                totalAmount: orderDetails.products[orderProductIndex].totalAmount,
                unitPrice: orderDetails.products[orderProductIndex].unitPrice,
            }, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            if (!result.error) {
                setIsUpdatingStatus(false);
                setSuccessMsg("Updating Success !!");
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setSelectedOrderProductIndex(-1);
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setSelectedOrderProductIndex(-1);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsUpdatingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteProductFromOrder = async (orderProductIndex) => {
        try {
            setIsDeletingStatus(true);
            setSelectedOrderProductIndex(orderProductIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/orders/products/delete-product/${orderDetails._id}/${orderDetails.products[orderProductIndex].productId}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            if (!result.error) {
                setIsDeletingStatus(false);
                setSuccessMsg("Deleting Success !!");
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    setSelectedOrderProductIndex(-1);
                    orderDetails.products = result.data.newOrderProducts;
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setSelectedOrderProductIndex(-1);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsDeletingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedOrderProductIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="order-details admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Order Details</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4 p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hello To You In Orders Details Page</h1>
                        {Object.keys(orderDetails).length > 0 ? <div className="order-details-box p-3 data-box admin-dashbboard-data-box">
                            <table className="order-data-table mb-5 managment-table admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Reference / Product Id</th>
                                        <th>Quantity</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                        <th>Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.products.map((orderProduct, orderProductIndex) => (
                                        <tr key={orderProduct._id}>
                                            <td>{orderProduct._id}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control quantity"
                                                    defaultValue={orderProduct.quantity}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "quantity", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control name"
                                                    defaultValue={orderProduct.name}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "name", e.target.value)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control unit-price"
                                                    defaultValue={orderProduct.unitPrice}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "unitPrice", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control total-amount"
                                                    defaultValue={orderProduct.totalAmount}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "totalAmount", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${orderProduct.imagePath}`}
                                                    alt="product Image !!"
                                                    width="100"
                                                    height="100"
                                                />
                                            </td>
                                            <td>
                                                {!orderDetails.isDeleted ? <>
                                                    {selectedOrderProductIndex !== orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderProductData(orderProductIndex)}
                                                    >
                                                        Update
                                                    </button>}
                                                    {isUpdatingStatus && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Updating ...
                                                    </button>}
                                                    {selectedOrderProductIndex !== orderProductIndex && orderDetails.products.length > 1 && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteProductFromOrder(orderProductIndex)}
                                                    >
                                                        Delete
                                                    </button>}
                                                    {isDeletingStatus && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Deleting ...
                                                    </button>}
                                                    {successMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-success d-block mx-auto global-button"
                                                        disabled
                                                    >{successMsg}</button>}
                                                    {errorMsg && selectedOrderProductIndex === orderProductIndex && <button
                                                        className="btn btn-danger d-block mx-auto global-button"
                                                        disabled
                                                    >{errorMsg}</button>}
                                                </> : <span className="fw-bold text-danger">Reject Actions</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
                        {Object.keys(orderDetails).length > 0 && <section className="customer-info">
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="billing-address-box text-start p-3">
                                            <h6 className="fw-bold">Billing Address</h6>
                                            <hr />
                                            <p className="city fw-bold info">City: {orderDetails.billingAddress.city}</p>
                                            <p className="email fw-bold info">Email: {orderDetails.billingAddress.email}</p>
                                            <p className="name fw-bold info">Name: {orderDetails.billingAddress.firstName}</p>
                                            <p className="family-name fw-bold info">Family Name: {orderDetails.billingAddress.lastName}</p>
                                            <p className="phone fw-bold info">Phone: {orderDetails.billingAddress.phone}</p>
                                            <p className="postal-code fw-bold info">Postal Code: {orderDetails.billingAddress.postalCode}</p>
                                            <p className="street-address fw-bold info">Street Address: {orderDetails.billingAddress.streetAddress}</p>
                                            <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.billingAddress.apartmentNumber}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="shipping-address-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Address</h6>
                                            <hr />
                                            <p className="city fw-bold info">City: {orderDetails.shippingAddress.city}</p>
                                            <p className="email fw-bold info">Email: {orderDetails.shippingAddress.email}</p>
                                            <p className="name fw-bold info">Name: {orderDetails.shippingAddress.firstName}</p>
                                            <p className="family-name fw-bold info">Family Name: {orderDetails.shippingAddress.lastName}</p>
                                            <p className="phone fw-bold info">Phone: {orderDetails.shippingAddress.phone}</p>
                                            <p className="postal-code fw-bold info">Postal Code: {orderDetails.shippingAddress.postalCode}</p>
                                            <p className="street-address fw-bold info">Street Address: {orderDetails.shippingAddress.streetAddress}</p>
                                            <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.shippingAddress.apartmentNumber}</p>
                                        </div>
                                    </div>
                                </div>
                        </section>}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps(context) {
    const orderId = context.query.orderId;
    if (!orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/404",
            },
        }
    } else {
        return {
            props: {
                orderIdAsProperty: orderId,
            },
        }
    }
}