
import { SettingsDocumentData } from "../../prismicio-types";


export interface MenuProps {
    isOpen: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
    settings: SettingsDocumentData;
}

export interface NavbarState {
    navOpen: boolean;
    activeSubmenu: string | null;
}

export interface MousePosition {
    x: number;
    y: number;
}