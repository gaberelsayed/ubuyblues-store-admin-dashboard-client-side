import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/router.js";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

export default function AdminPanelHeader({ isWebsiteOwner = false, isMerchant = false }) {

    const router = useRouter();

    const adminLogout = async () => {
        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
        await router.replace("/login");
    }

    const handleSelectCountry = async (country) => {
        try {
            switch (country) {
                case "kuwait": {
                    localStorage.setItem("asfour-store-country", country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return;
                }
                case "germany": {
                    localStorage.setItem("asfour-store-country", country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return;
                }
                case "turkey": {
                    localStorage.setItem("asfour-store-country", country);
                    await router.replace({
                        pathname: router.pathname,
                        query: {
                            ...router.query,
                            country,
                        }
                    });
                    return
                }
                default: {
                    return "Sorry, Invalid Country !!";
                }
            }

        }
        catch (err) {
            return err;
        }
    }

    return (
        <header className="admin-panel-header">
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand href="/" as={Link}>Ubuyblues Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav>
                            {router.pathname === "/orders-managment/billing/[orderId]" && <NavDropdown title="Countries" id="products-nav-dropdown">
                                <NavDropdown.Item onClick={() => handleSelectCountry("kuwait")}>KW</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("germany")}>DE</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={() => handleSelectCountry("turkey")}>TR</NavDropdown.Item>
                            </NavDropdown>}
                            {isWebsiteOwner && <>
                                <NavDropdown title="Stores" id="stores-nav-dropdown">
                                    <NavDropdown.Item href="/stores-managment" as={Link}>All Stores</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Global" id="global-nav-dropdown">
                                    <NavDropdown.Item href="/global-managment/show-and-hide-sections-managment" as={Link}>Show / Hide Sections</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="/global-managment/change-bussiness-email-password" as={Link}>
                                        Change Bussiness Email Password
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>}
                            {isMerchant && <NavDropdown title="Admins" id="admins-nav-dropdown">
                                <NavDropdown.Item href="/admins-managment/add-new-admin" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/admins-managment/update-and-delete-admins" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>}
                            <NavDropdown title="Products" id="products-nav-dropdown">
                                <NavDropdown.Item href="/products-managment/add-new-product" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/products-managment/update-and-delete-products" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Categories" id="categories-nav-dropdown">
                                <NavDropdown.Item href="/categories-managment/add-new-category" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/categories-managment/update-and-delete-categories" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Orders" id="orders-nav-dropdown">
                                <NavDropdown.Item href="/orders-managment" as={Link}>All Orders</NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Brands" id="brands-nav-dropdown">
                                <NavDropdown.Item href="/brands-managment/add-new-brand" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/brands-managment/update-and-delete-brands" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <NavDropdown title="Ads" id="ads-nav-dropdown">
                                <NavDropdown.Item href="/ads-managment/add-new-ad" as={Link}>Add New</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/ads-managment/update-and-delete-ads" as={Link}>
                                    Update / Delete
                                </NavDropdown.Item>
                            </NavDropdown>
                            <button className="btn btn-danger logout-btn" onClick={adminLogout}>
                                <MdOutlineLogout className="me-2" />
                                <span>Logout</span>
                            </button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}