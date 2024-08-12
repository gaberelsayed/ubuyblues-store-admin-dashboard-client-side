import Head from "next/head";
import { PiHandWavingThin } from "react-icons/pi";
import { useEffect, useState } from "react";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { useRouter } from "next/router";
import PaginationBar from "@/components/PaginationBar";
import { getAdminInfo, getDateFormated } from "../../../public/global_functions/popular";

export default function UsersManagment() {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [isGetUsers, setIsGetUsers] = useState(false);

    const [allUsersInsideThePage, setAllUsersInsideThePage] = useState([]);

    const [waitMsg, setWaitMsg] = useState(false);

    const [selectedUserIndex, setSelectedUserIndex] = useState(-1);

    const [errorMsg, setErrorMsg] = useState(false);

    const [successMsg, setSuccessMsg] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPagesCount, setTotalPagesCount] = useState(0);

    const [filters, setFilters] = useState({
        isVerified: true,
        _id: "",
        firstName: "",
        lastName: "",
    });

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
                        if (adminDetails.isWebsiteOwner) {
                            setAdminInfo(adminDetails);
                            const filtersAsQuery = getFiltersAsQuery(filters);
                            result = await getUsersCount(filtersAsQuery);
                            if (result.data > 0) {
                                setAllUsersInsideThePage((await getAllUsersInsideThePage(1, pageSize, filtersAsQuery)).data);
                                setTotalPagesCount(Math.ceil(result.data / pageSize));
                            }
                            setIsLoadingPage(false);
                        }
                        else {
                            await router.replace("/");
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

    const getFiltersAsQuery = (filters) => {
        let filteringString = "";
        if (filters.isVerified) filteringString += `isVerified=${filters.isVerified}&`;
        if (filters._id) filteringString += `_id=${filters._id}&`;
        if (filters.email) filteringString += `email=${filters.email}&`;
        if (filters.firstName) filteringString += `firstName=${filters.firstName}&`;
        if (filters.lastName) filteringString += `lastName=${filters.lastName}&`;
        if (filteringString) filteringString = filteringString.substring(0, filteringString.length - 1);
        return filteringString;
    }

    const getUsersCount = async (filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/users/users-count?${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getAllUsersInsideThePage = async (pageNumber, pageSize, filters) => {
        try {
            return (await axios.get(`${process.env.BASE_API_URL}/users/all-users-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const getPreviousPage = async () => {
        setIsGetUsers(true);
        const newCurrentPage = currentPage - 1;
        setAllUsersInsideThePage((await getAllUsersInsideThePage(newCurrentPage, pageSize)).data);
        setCurrentPage(newCurrentPage);
        setIsGetUsers(false);
    }

    const getNextPage = async () => {
        setIsGetUsers(true);
        const newCurrentPage = currentPage + 1;
        setAllUsersInsideThePage((await getAllUsersInsideThePage(newCurrentPage, pageSize)).data);
        setCurrentPage(newCurrentPage);
        setIsGetUsers(false);
    }

    const getSpecificPage = async (pageNumber) => {
        setIsGetUsers(true);
        setAllUsersInsideThePage((await getAllUsersInsideThePage(pageNumber, pageSize)).data);
        setCurrentPage(pageNumber);
        setIsGetUsers(false);
    }

    const filterUsers = async (filters) => {
        try {
            setIsGetUsers(true);
            setCurrentPage(1);
            const filteringString = getFiltersAsQuery(filters);
            const result = await getUsersCount(filteringString);
            if (result.data > 0) {
                setAllUsersInsideThePage((await getAllUsersInsideThePage(1, pageSize, filteringString)).data);
                setTotalPagesCount(Math.ceil(result.data / pageSize));
                setIsGetUsers(false);
            } else {
                setAllUsersInsideThePage([]);
                setTotalPagesCount(0);
                setIsGetUsers(false);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsGetUsers(false);
            setErrorMsg("");
            let errorTimeout = setTimeout(() => {
                setErrorMsg(false);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteUser = async (userIndex) => {
        try {
            setWaitMsg("Please Waiting Deleting ...");
            setSelectedUserIndex(userIndex);
            const result = (await axios.delete(`${process.env.BASE_API_URL}/users/${allUsersInsideThePage[userIndex]._id}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            })).data;
            setWaitMsg("");
            if (!result.error) {
                setSuccessMsg("Deleting Successfull !!");
                let successTimeout = setTimeout(async () => {
                    setSuccessMsg("");
                    setSelectedUserIndex(-1);
                    setAllUsersInsideThePage(allUsersInsideThePage.filter((user, index) => index !== userIndex));
                    clearTimeout(successTimeout);
                }, 1500);
            } else {
                setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
                let errorTimeout = setTimeout(() => {
                    setErrorMsg("");
                    setSelectedUserIndex(-1);
                    clearTimeout(errorTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.push("/login");
                return;
            }
            setWaitMsg("");
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                setSelectedUserIndex(-1);
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="users-managment admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Users Managment</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                <div className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-5 pb-5">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">
                            <PiHandWavingThin className="me-2" />
                            Hi, Mr {adminInfo.firstName + " " + adminInfo.lastName} In Your Users Managment Page
                        </h1>
                        <section className="filters mb-5 bg-white border-3 border-info p-3 text-start">
                            <h5 className="section-name fw-bold text-center">Filters: </h5>
                            <hr />
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">User Id</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter User Id"
                                        onChange={(e) => setFilters({ ...filters, _id: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <h6 className="me-2 fw-bold text-center">Email</h6>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Pleae Enter Email"
                                        onChange={(e) => setFilters({ ...filters, email: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-3">
                                    <h6 className="me-2 fw-bold text-center">First Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter First Name"
                                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value.trim() })}
                                    />
                                </div>
                                <div className="col-md-6 mt-3">
                                    <h6 className="me-2 fw-bold text-center">Last Name</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Pleae Enter Last Name"
                                        onChange={(e) => setFilters({ ...filters, lastName: e.target.value.trim() })}
                                    />
                                </div>
                            </div>
                            {!isGetUsers && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                onClick={() => filterUsers(filters)}
                            >
                                Filter
                            </button>}
                            {isGetUsers && <button
                                className="btn btn-success d-block w-25 mx-auto mt-2 global-button"
                                disabled
                            >
                                Filtering ...
                            </button>}
                        </section>
                        {allUsersInsideThePage.length > 0 && !isGetUsers && <section className="users-box w-100">
                            <table className="users-table mb-4 managment-table bg-white w-100">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Email</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Date Of Creation</th>
                                        <th>Process</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsersInsideThePage.map((user, userIndex) => (
                                        <tr key={user._id}>
                                            <td className="user-email-cell">
                                                {user._id}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.email}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.firstName ? user.firstName : "---------"}
                                            </td>
                                            <td className="user-email-cell">
                                                {user.lastName ? user.lastName : "---------"}
                                            </td>
                                            <td className="user-email-cell">
                                                {getDateFormated(user.dateOfCreation)}
                                            </td>
                                            <td className="update-cell">
                                                {selectedUserIndex !== userIndex && <>
                                                    <button
                                                        className="btn btn-danger global-button"
                                                        onClick={() => deleteUser(userIndex)}
                                                    >Delete</button>
                                                </>}
                                                {waitMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-info d-block mb-3 mx-auto global-button"
                                                    disabled
                                                >{waitMsg}</button>}
                                                {successMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-success d-block mx-auto global-button"
                                                    disabled
                                                >{successMsg}</button>}
                                                {errorMsg && selectedUserIndex === userIndex && <button
                                                    className="btn btn-danger d-block mx-auto global-button"
                                                    disabled
                                                >{errorMsg}</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>}
                        {allUsersInsideThePage.length === 0 && !isGetUsers && <p className="alert alert-danger w-100">Sorry, Can't Find Any Users !!</p>}
                        {isGetUsers && <div className="loader-table-box d-flex flex-column align-items-center justify-content-center">
                            <span className="loader-table-data"></span>
                        </div>}
                        {totalPagesCount > 1 && !isGetUsers &&
                            <PaginationBar
                                totalPagesCount={totalPagesCount}
                                currentPage={currentPage}
                                getPreviousPage={getPreviousPage}
                                getNextPage={getNextPage}
                                getSpecificPage={getSpecificPage}
                            />
                        }
                    </div>
                </div>
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}