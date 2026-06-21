import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { appAssets } from '@/shared/config/assets';
import { getNavItemByPath } from '@/shared/config/nav.config';

export function usePageTitle(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const item = getNavItemByPath(pathname);
    document.title = item
      ? `${item.label} | ${appAssets.brand.shortName}`
      : appAssets.brand.name;
  }, [pathname]);
}

export function useCurrentNavItem() {
  const { pathname } = useLocation();
  return getNavItemByPath(pathname);
}
