# Guía de Comandos Git para Zave Finance App

Esta guía contiene los comandos más útiles para gestionar el control de versiones del proyecto Zave Finance App.

## Ver el historial de cambios

Para ver todos los commits realizados:

```powershell
git log
```

Para ver un resumen más compacto del historial:

```powershell
git log --oneline
```

Para ver los cambios de un archivo específico:

```powershell
git log --follow [archivo]
```

## Navegar entre versiones

### Explorar temporalmente un commit anterior

```powershell
git checkout [hash_del_commit]
```

*Ejemplo:* `git checkout 692f077`

Para volver al estado actual después de explorar:

```powershell
git checkout master
```

### Crear una rama desde un punto anterior

```powershell
git checkout -b [nombre_rama] [hash_del_commit]
```

*Ejemplo:* `git checkout -b version1 692f077`

Esto es útil para crear versiones alternativas o experimentales basadas en estados anteriores del proyecto.

### Moverse entre ramas

```powershell
git checkout master    # Volver a la rama principal
git checkout version1  # Ir a la versión alternativa
```

## Revertir cambios

### Revertir conservando el historial

```powershell
git revert [hash_del_commit]
```

Esto crea un nuevo commit que deshace los cambios del commit especificado, pero mantiene todo el historial.

### Reset (usar con precaución)

```powershell
git reset --hard [hash_del_commit]
```

⚠️ **Advertencia**: Este comando elimina permanentemente todos los commits posteriores al especificado. Solo usar cuando estés seguro de querer descartar cambios.

## Gestionar cambios locales

### Guardar cambios temporales (stash)

Si necesitas cambiar de rama pero tienes cambios sin commit:

```powershell
git stash save "mensaje descriptivo"
```

Para recuperar los cambios guardados:

```powershell
git stash pop
```

Para ver la lista de stashes:

```powershell
git stash list
```

## Sincronizar con el repositorio remoto

### Subir cambios

```powershell
git push
```

Si es la primera vez que subes una rama:

```powershell
git push -u origin [nombre_rama]
```

### Obtener cambios

```powershell
git pull
```

## Consejos para Zave Finance App

1. Antes de implementar nuevas características importantes, crea una nueva rama:
   ```powershell
   git checkout -b feature/[nombre-caracteristica]
   ```

2. Para versiones importantes, etiqueta el commit:
   ```powershell
   git tag -a v1.0 -m "Versión 1.0"
   git push origin v1.0
   ```

3. Si necesitas realizar una copia de seguridad rápida del proyecto:
   ```powershell
   Compress-Archive -Path "./*" -DestinationPath "../zave-finance-app-backup.zip" -Force
   ```

4. Recuerda hacer commits pequeños y descriptivos regularmente para facilitar el seguimiento de cambios y posibles reversiones. 