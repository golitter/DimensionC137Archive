import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Custom `MatPaginatorIntl` component to customize the text displayed on the paginator.
 * This class overrides the `getRangeLabel` method to format the information text displayed at the bottom of the paginator.
 */
@Injectable()
export class paginatorIntlComponent  extends MatPaginatorIntl {

  /**
   * Get the range label for the paginator, displaying the current page range and total pages information.
   * 
   * @param page Current page number (starting from 0)
   * @param pageSize Number of items displayed per page
   * @param length Total number of data items
   * @returns {string} The formatted range label, displaying the total number of items and current page information
   */
  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    // If the data is empty or the page size is 0, display "0 pages"
    if (length === 0 || pageSize === 0) {
      return `Total 0 items, Page 0 / 0`;
    }

    // Calculate the total number of pages
    const totalPages = Math.ceil(length / pageSize);

    // Return the formatted paginator text
    return `Total ${length} items, Page ${page + 1} / ${totalPages}`;
  };
}
