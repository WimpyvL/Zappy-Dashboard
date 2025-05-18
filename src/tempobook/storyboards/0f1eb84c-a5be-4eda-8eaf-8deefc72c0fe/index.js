import React, { useState } from 'react';
import FormPagesV2 from '@/pages/settings/pages/forms-v2/FormPagesV2';

export default function FormPagesV2Storyboard() {
  // Sample pages data
  const [pages, setPages] = useState([
    { title: 'Basic Information', elements: [] },
    { title: 'Medical History', elements: [] },
    { title: 'Symptoms', elements: [] },
  ]);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const handleAddPage = () => {
    setPages([...pages, { title: `Page ${pages.length + 1}`, elements: [] }]);
    setCurrentPageIndex(pages.length);
  };

  const handleDeletePage = (index) => {
    const newPages = [...pages];
    newPages.splice(index, 1);
    setPages(newPages);

    // Adjust current page index if needed
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(Math.max(0, newPages.length - 1));
    }
  };

  const handleUpdatePageTitle = (index, title) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], title };
    setPages(newPages);
  };

  return (
    <div className="bg-white">
      <FormPagesV2
        pages={pages}
        currentPageIndex={currentPageIndex}
        onChangePage={setCurrentPageIndex}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        onUpdatePageTitle={handleUpdatePageTitle}
      />
    </div>
  );
}
