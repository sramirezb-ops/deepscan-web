import { markup } from '@/components/markup';
import SiteScripts from '@/components/SiteScripts';

export default function Home() {
  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />
      <SiteScripts />
    </>
  );
}
