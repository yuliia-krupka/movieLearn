import type {MenuProps} from "antd";
import {
    BarChartOutlined,
    HomeOutlined,
    UserOutlined,
    PlusCircleOutlined,
    DashboardOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

export const getMenuItems = (
    navigate: (path: string) => void,
    isAdmin: boolean,
    closeDrawer?: () => void
): MenuItem[] => {
    const navigateAndClose = (path: string) => {
        navigate(path);
        if (closeDrawer) closeDrawer();
    };

    const handleClick = (key: string) => {
        navigateAndClose(key);
    };

    return [
        (!isAdmin ? {
            key: "/home",
            icon: <HomeOutlined/>,
            label: "Home",
            onClick: () => handleClick("/home"),
        } : null),
        (!isAdmin ? {
            key: "/movies/new",
            icon: <PlusCircleOutlined/>,
            label: "Add Movie",
            onClick: () => handleClick("/movies/new"),
        } : null),
        (isAdmin ? {
            key: "/admin",
            icon: <DashboardOutlined/>,
            label: "Admin Panel",
            onClick: () => handleClick("/admin"),
        } : null),
        {
            key: "/account",
            icon: <UserOutlined/>,
            label: "Account",
            onClick: () => handleClick("/account"),
        },
        (!isAdmin ? {
            key: "/statistics",
            icon: <BarChartOutlined/>,
            label: "Statistics",
            onClick: () => handleClick("/statistics"),
        } : null),
        {
            key: "/about",
            icon: <InfoCircleOutlined/>,
            label: "About",
            onClick: () => handleClick("/about"),
        },
    ].filter(Boolean) as MenuItem[];
};
