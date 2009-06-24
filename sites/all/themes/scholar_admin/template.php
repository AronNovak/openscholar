<?php

/**
* Hack a bit the attachment fieldset.
*/
function scholar_admin_upload_form_new($form) {
 unset($form['new']['upload']['#title']);
 unset($form['new']['upload']['#description']);
 drupal_add_tabledrag('upload-attachments', 'order', 'sibling', 'upload-weight');
 return drupal_render($form);
}

/**
* Massive hack of the upload form.
*/
function scholar_admin_upload_form_current(&$form) {
 drupal_add_tabledrag('upload-attachments', 'order', 'sibling', 'upload-weight');

 foreach (element_children($form) as $key) {
   // Add class to group weight fields for drag and drop.
   $form[$key]['weight']['#attributes']['class'] = 'upload-weight';
   $row = array('');
   $output = '';
   // Description: we save the URL, remove it as a description and change the size of the input
   $url = $form[$key]['description']['#description'];
   unset($form[$key]['description']['#description']);
   $form[$key]['description']['#size'] = 20;
   $form[$key]['description']['#attributes'] = array('class' => 'rename');
   $output .= drupal_render($form[$key]['description']);
   // Size & URL
   $output .= '<span class="details">'. drupal_render($form[$key]['size']) .' - '. $url .'</span>';
   $row[] = array(
     'data' => $output,
     'class' => 'file container-inline'
   );
   // Remove
   $form[$key]['remove']['#attributes'] = array('class' => 'remove');
   $form[$key]['remove']['#suffix'] = ' '. t('Remove');
   $row[] = array(
     'data' => drupal_render($form[$key]['remove']),
     'class' => 'remove container-inline'
   );
   // List
   $form[$key]['list']['#suffix'] = ' '. t('List');
   $row[] = array(
     'data' => drupal_render($form[$key]['list']),
     'class' => 'list container-inline'
   );
   // Weight
   $row[] = drupal_render($form[$key]['weight']);
   // Add the extension as a class for styling
   $extension = strtolower(substr(strrchr($form[$key]['filename']['#value'], '.'), 1));
   $rows[] = array('data' => $row, 'class' => 'draggable mime-'. $extension);
 }
 $output = theme('table', array(), $rows, array('id' => 'upload-attachments'));
 $output .= drupal_render($form);
 return $output;
}

/**
* Theme the attachments output.
*/
function scholar_admin_upload_attachments($files) {
 $items = array();
 foreach ($files as $file) {
   $file = (object)$file;
   if ($file->list && empty($file->remove)) {
     $extension = strtolower(substr(strrchr($file->filename, '.'), 1));
     $href = file_create_url($file->filepath);
     $text = $file->description ? $file->description : $file->filename;
     $items[] = array(
       'data' => l($text, $href) .' - '. format_size($file->filesize),
       'class' => 'mime-'. $extension,
     );
   }
 }
 if (count($items)) {
   return theme('item_list', $items, $title = NULL, $type = 'ul', array('class' => 'attachment-list', 'id' => 'attachments'));
 }
}


