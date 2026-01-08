import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        // Adjust direction for Arabic
        document.body.dir = lng === 'ar' ? 'rtl' : 'ltr';
        handleClose();
    };

    return (
        <>
            <Button
                color="inherit"
                startIcon={<LanguageIcon />}
                onClick={handleClick}
                sx={{ ml: 1 }}
            >
                {t('language')}
            </Button>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => changeLanguage('en')}>{t('english')}</MenuItem>
                <MenuItem onClick={() => changeLanguage('es')}>{t('spanish')}</MenuItem>
                <MenuItem onClick={() => changeLanguage('ar')}>{t('arabic')}</MenuItem>
            </Menu>
        </>
    );
};

export default LanguageSwitcher;
