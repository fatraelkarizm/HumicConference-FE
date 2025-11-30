// src/app/user/page.tsx

import ICICyTAPage from "./ICICyTA/page";
import ICoDSAPage from "./ICoDSA/page";
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
