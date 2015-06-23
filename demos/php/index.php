<?php

$data = array();

if(isset($_FILES['files']))
{
    $error = false;
    $files = array();

    $uploaddir = '../uploads/';

    for($i=0; $i<count($_FILES['files']['name']); $i++)
    {
        $fileName = $_FILES['files']['name'][$i];
        $fileTmpName = $_FILES['files']['tmp_name'][$i];

        if(move_uploaded_file($fileTmpName, $uploaddir .basename($fileName)))
        {
            $files[] = $uploaddir .$fileName;
        }
        else
        {
            $error = true;
        }
    }
    $data = ($error) ? array('error' => 'There was an error uploading your files') : array('files' => $files);
}
else
{
    $data = array('success' => 'Form was submitted', 'formData' => $_POST);
}

header('Content-Type: application/json');
echo json_encode($data);