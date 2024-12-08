'use client';

import { useState, useEffect } from 'react';
import { ColDef } from 'ag-grid-community';
import {
  getData, createRecord, updateRecord, deleteRecord,
} from '@/app/shared/utils/apiUtils';
import { ModalAddCnl, ModalCancelar } from '@/app/shared/modals/sso';
import { CredencialFields } from '@/app/services/handlers/formFields';
import { TableTemplate, ActionButtons } from '@/app/shared/common';
import { useAuthContext } from '@/app/context/AuthContext';

interface CredencialData {
  curp: string;
  usuario: string;
  grupo: string;
  etiquetas: string;
  perfil: string;
  tipo: string;
  estado: string;
  idCredencial?: number;
}

export default function TableCredenciales() {
  const { setNoti } = useAuthContext();
  const [rowData, setRowData] = useState<CredencialData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);
  const [selectedRowsData, setSelectedRowsData] = useState<CredencialData[]>([]);
  const [selectedRowData, setSelectedRowData] = useState<CredencialData | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'agregar' | 'consultar' | 'editar'>('agregar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getData({ endpoint: '/credenciales' });
        setRowData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveCredencial = async (data: Record<string, string | string[]>) => {
    if (modalMode === 'editar' && selectedRowData) {
      const endpoint = `/credenciales/${selectedRowData.idCredencial}`;
      const response = await updateRecord({ endpoint, data });

      if (response.errorMessage) {
        setNoti({
          open: true,
          type: 'error',
          message: response.errorMessage,
        });
      } else {
        const { data: responseData } = await getData({ endpoint: '/credenciales' });
        setRowData(responseData);
        setOpenModal(false);
        setNoti({
          open: true,
          type: 'success',
          message: '¡Credencial actualizada con éxito!',
        });
      }
    } else {
      const response = await createRecord({ endpoint: '/credenciales', data });
      if (response.errorMessage) {
        setNoti({
          open: true,
          type: 'error',
          message: response.errorMessage,
        });
      } else {
        const { data: responseData } = await getData({ endpoint: '/credenciales' });
        setRowData(responseData);
        setOpenModal(false);
        setNoti({
          open: true,
          type: 'success',
          message: '¡Credencial creada con éxito!',
        });
      }
    }
  };

  const handleOpenModal = (actionType: string) => {
    if (actionType === 'Agregar') {
      setModalMode('agregar');
      setSelectedRowData(null);
      setOpenModal(true);
    } else if (actionType === 'Consultar' && selectedRowsCount === 1) {
      setModalMode('consultar');
      setOpenModal(true);
    } else if (actionType === 'Editar' && selectedRowsCount === 1) {
      setModalMode('editar');
      setOpenModal(true);
    } else if (actionType === 'Cancelar' && selectedRowsCount >= 1) {
      setOpenCancelModal(true);
    }
  };

  const handleConfirmCancel = async () => {
    const idsToDelete = selectedRowsData.map((row) => row.idCredencial);
    const endpoint = `/credenciales/${idsToDelete.join(',')}`;

    const response = await deleteRecord({ endpoint });
    if (response.errorMessage) {
      setNoti({
        open: true,
        type: 'error',
        message: response.errorMessage,
      });
    } else {
      setNoti({
        open: true,
        type: 'success',
        message: '¡Credenciales canceladas con éxito!',
      });
      setOpenCancelModal(false);
      const { data: responseData } = await getData({ endpoint: '/credenciales' });
      setRowData(responseData);
    }
  };

  const colDefs: ColDef[] = [
    {
      field: 'curp',
      headerName: 'CURP',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'usuario',
      headerName: 'Usuario',
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      field: 'grupo',
      headerName: 'Grupo',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'etiquetas',
      headerName: 'Etiquetas',
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      field: 'perfil',
      headerName: 'Perfil',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      sortable: true,
      filter: true,
      flex: 1,
    },
  ];

  const isRowSelectable = (rowNode: any) => rowNode.data.grupo !== 'administrador';

  const handleRowSelectionChanged = (params: any) => {
    const selectedRows = params.api.getSelectedRows();
    setSelectedRowsCount(selectedRows.length);
    setSelectedRowData(selectedRows.length === 1 ? selectedRows[0] : null);
    setSelectedRowsData(selectedRows);
  };

  return (
    <>
      <ActionButtons
        tableType='credenciales'
        selectedRowsCount={selectedRowsCount}
        onButtonClick={handleOpenModal}
      />
      <TableTemplate
        rowData={rowData}
        colDefs={colDefs}
        pageSize={20}
        loading={loading}
        selectionMode='multiRow'
        isRowSelectable={isRowSelectable}
        onSelectionChanged={handleRowSelectionChanged}
        enableSelection
      />
      <ModalAddCnl
        title='Credencial'
        open={openModal}
        onClose={() => setOpenModal(false)}
        fields={CredencialFields}
        onSubmit={handleSaveCredencial}
        mode={modalMode}
        selectedData={selectedRowData}
      />
      <ModalCancelar
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        selectedRows={selectedRowsData}
        colDefs={colDefs}
        onConfirmCancel={handleConfirmCancel}
      />
    </>
  );
}
