'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { getData, updateRecord } from '@/app/shared/utils/apiUtils';
import { TableTemplate } from '@/app/shared/common';
import { useAuthContext } from '@/app/context/AuthContext';
import DefaultModal from '../DefaultModal';

interface ModalPermisosProps {
  open: boolean;
  onClose: () => void;
  selectedRole: { idRol: number; nombre: string } | null;
}

interface PermisoData {
  idAplicacion: number;
  nombreAplicacion: string;
  idModulo: number;
  nombreModulo: string;
  Crear: number;
  Consultar: number;
  Actualizar: number;
  Eliminar: number;
  Subir: number;
}

const buttonStyles = {
  py: 1,
  px: 3,
  borderRadius: '8px',
  fontFamily: 'MadaniArabic-SemiBold',
  textTransform: 'capitalize',
  fontSize: '0.875rem',
};

export default function ModalPermisos({
  open,
  onClose,
  selectedRole,
}: ModalPermisosProps) {
  const [permisos, setPermisos] = useState<PermisoData[]>([]);
  const [aplicaciones, setAplicaciones] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [filteredModules, setFilteredModules] = useState<PermisoData[]>([]);
  const [updatedPermisos, setUpdatedPermisos] = useState<{
    [key: number]: { [action: string]: number };
  }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { setNoti } = useAuthContext();

  useEffect(() => {
    const fetchPermisos = async () => {
      if (selectedRole && open) {
        try {
          setLoading(true);
          const { data } = await getData({
            endpoint: `/roles/${selectedRole.idRol}/accesos`,
          });
          setPermisos(data || []);
          const uniqueApps = Array.from(
            new Map<number, string>(
              data.map((permiso: PermisoData) => [permiso.idAplicacion, permiso.nombreAplicacion]),
            ),
            ([id, nombre]) => ({ id, nombre }),
          );

          setAplicaciones(uniqueApps);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPermisos();
  }, [open, selectedRole]);

  useEffect(() => {
    if (selectedApp !== null) {
      const modules = permisos.filter((permiso) => permiso.idAplicacion === selectedApp);
      setFilteredModules(modules);
    }
  }, [selectedApp, permisos]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = filteredModules.map((module) => ({
        idModulo: module.idModulo,
        idRol: selectedRole?.idRol || 0,
        Crear: updatedPermisos[module.idModulo]?.Crear ?? module.Crear,
        Consultar: updatedPermisos[module.idModulo]?.Consultar ?? module.Consultar,
        Actualizar: updatedPermisos[module.idModulo]?.Actualizar ?? module.Actualizar,
        Eliminar: updatedPermisos[module.idModulo]?.Eliminar ?? module.Eliminar,
        Subir: updatedPermisos[module.idModulo]?.Subir ?? module.Subir,
      }));
      await updateRecord({
        endpoint: `/roles/${selectedRole?.idRol}/accesos`,
        data: updates,
      });
      onClose();
      setNoti({
        open: true,
        type: 'success',
        message: '¡Permisos actualizados correctamente!',
      });
    } catch (error) {
      setNoti({
        open: true,
        type: 'error',
        message: 'Error al actualizar los permisos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const colDefs = [
    {
      field: 'nombreModulo',
      headerName: 'Módulo',
      flex: 2,
      editable: false,
    },
    ...['Crear', 'Consultar', 'Actualizar', 'Eliminar', 'Subir'].map((action) => ({
      field: action,
      headerName: action,
      flex: 1,
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      valueGetter: (params: any) => params.data[action] === 1,
      valueSetter: (params: any) => {
        const newValue = params.newValue ? 1 : 0;
        setUpdatedPermisos((prev) => ({
          ...prev,
          [params.data.idModulo]: {
            ...(prev[params.data.idModulo] || {}),
            [action]: newValue,
          },
        }));
        // eslint-disable-next-line no-param-reassign
        params.data[action] = newValue;
        return true;
      },
    })),
  ];

  return (
    <DefaultModal open={open} onClose={onClose} title='Administrar Permisos'>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'MadaniArabic-Regular',
              color: '#32169b',
            }}
          >
            Seleccione una aplicación:
          </Typography>
          <Select
            variant='outlined'
            fullWidth
            value={selectedApp || ''}
            onChange={(e) => setSelectedApp(Number(e.target.value))}
            sx={{ mb: 3 }}
          >
            {aplicaciones.map((app) => (
              <MenuItem key={app.id} value={app.id}>
                {app.nombre}
              </MenuItem>
            ))}
          </Select>
          {selectedApp !== null && (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <TableTemplate
                rowData={filteredModules}
                colDefs={colDefs}
                pageSize={20}
                loading={loading}
                height={350}
              />
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant='contained'
              startIcon={<Close />}
              onClick={onClose}
              sx={{
                ...buttonStyles,
                backgroundColor: 'rgb(255, 77, 99)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgb(200, 50, 70)' },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                ...buttonStyles,
                backgroundColor: '#32169b',
                '&:hover': {
                  backgroundColor: '#14005E',
                },
              }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      )}
    </DefaultModal>
  );
}