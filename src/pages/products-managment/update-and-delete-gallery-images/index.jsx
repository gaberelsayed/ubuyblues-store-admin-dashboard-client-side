import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { inputValuesValidation } from "../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../public/global_functions/popular";

export default function UpdateAndDeleteGalleryImages() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetGalleryImages, setIsGetGalleryImages] = useState(false);

    const [allGalleryImages, setAllGalleryImages] = useState([]);

    const [waitMsg, setWaitMsg] = useState("");

    const [selectedBrandImageIndex, setSelectedBrandImageIndex] = useState(-1);

    const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);

    const [isChangeBrandImage, setIsChangeBrandImage] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [errorChangeBrandImageMsg, setErrorChangeBrandImageMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const [successChangeBrandImageMsg, setSuccessChangeBrandImageMsg] = useState("");

    const [formValidationErrors, setFormValidationErrors] = useState({});

    const router = useRouter();

    const pageSize = 10;

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
                        }
                        else {
                            setAdminInfo(adminDetails);
                            setAllGalleryImages((await getAllGalleryImages()).data);
                            setIsLoadingPage(false);
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

    const getAllGalleryImages = async () => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/products/${productIdAsProperty}/all-gallery-images`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage)
                }
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const changeGalleryImage = async (imageIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "image",
                    value: allGalleryImages[imageIndex].image,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                        isImage: {
                            msg: "Sorry, Invalid Image Type, Please Upload JPG Or PNG Image File !!",
                        },
                    },
                },
            ]);
            setSelectedBrandImageIndex(imageIndex);
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsChangeBrandImage(true);
                let formData = new FormData();
                formData.append("brandImage", allGalleryImages[imageIndex].image);
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/change-brand-image/${allGalleryImages[imageIndex]._id}`, formData, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                if (!result.error) {
                    setIsChangeBrandImage(false);
                    setSuccessChangeBrandImageMsg("Change Image Successfull !!");
                    let successTimeout = setTimeout(async () => {
                        setSuccessChangeBrandImageMsg("");
                        setSelectedBrandImageIndex(-1);
                        setAllGalleryImages((await getAllGalleryImages(currentPage, pageSize, getFilteringString(filters))).data);
                        clearTimeout(successTimeout);
                    }, 1500);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setSelectedBrandImageIndex(-1);
            setIsChangeBrandImage(false);
            setErrorChangeBrandImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeBrandImageMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const updateBrandInfo = async (imageIndex) => {
        try {
            setFormValidationErrors({});
            const errorsObject = inputValuesValidation([
                {
                    name: "title",
                    value: allGalleryImages[imageIndex].title,
                    rules: {
                        isRequired: {
                            msg: "Sorry, This Field Can't Be Empty !!",
                        },
                    },
                },
            ]);
            setFormValidationErrors(errorsObject);
            setSelectedBrandIndex(imageIndex);
            if (Object.keys(errorsObject).length == 0) {
                setWaitMsg("Please Waiting Updating ...");
                const res = await axios.put(`${process.env.BASE_API_URL}/brands/${allGalleryImages[imageIndex]._id}`, {
                    newBrandTitle: allGalleryImages[imageIndex].title,
                }, {
                    headers: {
                        Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                    }
                });
                const result = res.data;
                setWaitMsg("");
                if (!result.error) {
                    setSuccessMsg("Updating Successfull !!");
                    let successTimeout = setTimeout(() => {
                        setSuccessMsg("");
                        setSelectedBrandIndex(-1);
                        clearTimeout(successTimeout);
                    }, 1500);
                } else {
                    setSelectedBrandIndex(-1);
                }
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedBrandIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteImageFromGallery = async (imageIndex) => {
        try {
            setWaitMsg("Please Waiting Deleting ...");
            setSelectedBrandIndex(imageIndex);
            const res = await axios.delete(`${process.env.BASE_API_URL}/brands/${allGalleryImages[imageIndex]._id}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedBrandIndex(-1);
                    setAllGalleryImages(allGalleryImages.filter((brand) => brand._id !== allGalleryImages[imageIndex]._id));
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedBrandIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="update-and-delete-brands admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Update / Delete Brands</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column p-5">
                    <h1 className="fw-bold w-fit pb-2 mb-4">
                        <PiHandWavingThin className="me-2" />
                        Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Update / Delete Brands Page
                    </h1>
                    {allGalleryImages.length > 0 && !isGetGalleryImages && <section className="brands-box admin-dashbboard-data-box w-100">
                        <table className="brands-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allGalleryImages.map((brand, imageIndex) => (
                                    <tr key={brand._id}>
                                        <td className="brand-title-cell">
                                            <section className="brand-title mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter New Brand Title"
                                                    defaultValue={brand.title}
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-title-field ${formValidationErrors["title"] && imageIndex === selectedBrandIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(imageIndex, "title", e.target.value.trim())}
                                                ></input>
                                                {formValidationErrors["title"] && imageIndex === selectedBrandIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["title"]}</span>
                                                </p>}
                                            </section>
                                        </td>
                                        <td className="brand-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${brand.imagePath}`}
                                                alt={`${brand.title} Brand Image !!`}
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                            <section className="brand-image mb-4">
                                                <input
                                                    type="file"
                                                    className={`form-control d-block mx-auto p-2 border-2 brand-image-field ${formValidationErrors["image"] && imageIndex === selectedBrandImageIndex ? "border-danger mb-3" : "mb-4"}`}
                                                    onChange={(e) => changeBrandData(imageIndex, "image", e.target.files[0])}
                                                    accept=".png, .jpg, .webp"
                                                />
                                                {formValidationErrors["image"] && imageIndex === selectedBrandImageIndex && <p className="bg-danger p-2 form-field-error-box m-0 text-white">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors["image"]}</span>
                                                </p>}
                                            </section>
                                            {(selectedBrandImageIndex !== imageIndex && selectedBrandIndex !== imageIndex) &&
                                                <button
                                                    className="btn btn-success d-block mb-3 w-50 mx-auto global-button"
                                                    onClick={() => changeGalleryImage(imageIndex)}
                                                >Change</button>
                                            }
                                            {isChangeBrandImage && selectedBrandImageIndex === imageIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                            >Please Waiting</button>}
                                            {successChangeBrandImageMsg && selectedBrandImageIndex === imageIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successChangeBrandImageMsg}</button>}
                                            {errorChangeBrandImageMsg && selectedBrandImageIndex === imageIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorChangeBrandImageMsg}</button>}
                                        </td>
                                        <td className="update-cell">
                                            {selectedBrandIndex !== imageIndex && <>
                                                <button
                                                    className="btn btn-success d-block mb-3 mx-auto global-button"
                                                    onClick={() => updateBrandInfo(imageIndex)}
                                                >Update</button>
                                                <hr />
                                                <button
                                                    className="btn btn-danger global-button"
                                                    onClick={() => deleteImageFromGallery(imageIndex)}
                                                >Delete</button>
                                            </>}
                                            {waitMsg && selectedBrandIndex === imageIndex && <button
                                                className="btn btn-info d-block mb-3 mx-auto global-button"
                                                disabled
                                            >{waitMsg}</button>}
                                            {successMsg && selectedBrandIndex === imageIndex && <button
                                                className="btn btn-success d-block mx-auto global-button"
                                                disabled
                                            >{successMsg}</button>}
                                            {errorMsg && selectedBrandIndex === imageIndex && <button
                                                className="btn btn-danger d-block mx-auto global-button"
                                                disabled
                                            >{errorMsg}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>}
                    {allGalleryImages.length === 0 && !isGetGalleryImages && <p className="alert alert-danger w-100">Sorry, Can't Find Any Brands !!</p>}
                    {isGetGalleryImages && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                        <span className="loader-table-data"></span>
                    </div>}
                    {totalPagesCount > 1 && !isGetGalleryImages &&
                        <PaginationBar
                            totalPagesCount={totalPagesCount}
                            currentPage={currentPage}
                            getPreviousPage={getPreviousPage}
                            getNextPage={getNextPage}
                            getSpecificPage={getSpecificPage}
                        />
                    }
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const { productId } = params;
    if (!productId) {
        return {
            redirect: {
                permanent: false,
                destination: "/products-managment/update-and-delete-products",
            },
        }
    } else {
        return {
            props: {
                productIdAsProperty: productId,
            },
        }
    }
}