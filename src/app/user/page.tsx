// src/app/user/page.tsx

import ICICyTAPage from "./ICICYTA/page";
import ICoDSAPage from "./ICODSA/page";
export default function UserPage() {
  return (
    <>
      <main>
        <ICICyTAPage />
        <ICoDSAPage />
      </main>
    </>
  );
}
