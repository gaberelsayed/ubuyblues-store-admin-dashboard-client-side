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
import { inputValuesValidation } from "../../../../../public/global_functions/validations";
import { getAdminInfo } from "../../../../../public/global_functions/popular";

export default function UpdateAndDeleteGalleryImages({ productIdAsProperty }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetGalleryImages, setIsGetGalleryImages] = useState(false);

    const [allGalleryImages, setAllGalleryImages] = useState([]);

    const [selectedGalleryImageIndex, setSelectedGalleryImageIndex] = useState(-1);

    const [waitMsg, setWaitMsg] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

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
                    console.log(err);
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
            return (await axios.get(`${process.env.BASE_API_URL}/products/all-gallery-images/${productIdAsProperty}`, {
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
                    name: "galleryImage",
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
            setSelectedGalleryImageIndex(imageIndex);
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
                        setSelectedGalleryImageIndex(-1);
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
            setSelectedGalleryImageIndex(-1);
            setIsChangeBrandImage(false);
            setErrorChangeBrandImageMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorChangeBrandImageMsg("");
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
                    {allGalleryImages.length > 0 && !isGetGalleryImages && <section className="gallery-images-box admin-dashbboard-data-box w-100">
                        <table className="gallery-images-table mb-4 managment-table bg-white admin-dashbboard-data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Processes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allGalleryImages.map((imagePath, imageIndex) => (
                                    <tr key={imageIndex}>
                                        <td className="gallery-image-cell">
                                            <img
                                                src={`${process.env.BASE_API_URL}/${imagePath}`}
                                                alt="Gallery Image !!"
                                                width="100"
                                                height="100"
                                                className="d-block mx-auto mb-4"
                                            />
                                        </td>
                                        <td className="update-cell">
                                            {/* {selectedBrandIndex !== imageIndex && <>
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
                                            >{errorMsg}</button>} */}
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