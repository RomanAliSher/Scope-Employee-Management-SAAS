package com.initialrelase.ScopeBackend.Service.Implementation;

import com.initialrelase.ScopeBackend.Entity.Sprint;
import com.initialrelase.ScopeBackend.Repository.SprintRepository;
import com.initialrelase.ScopeBackend.Service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Service;

import java.beans.PropertyDescriptor;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;

    @Override
    public Sprint createSprint(Sprint sprint) {
        if (sprint.getStatus() == null) {
            sprint.setStatus("PLANNED");
        }
        return sprintRepository.save(sprint);
    }

    @Override
    public List<Sprint> getSprintsByWorkspace(String workspaceName) {
        // Using your exact repository method here
        return sprintRepository.findByWorkspaceNameOrderByCreatedAtDesc(workspaceName);
    }

    @Override
    public Sprint updateSprint(String id, Sprint sprintDto) {
        Sprint existingSprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found with ID: " + id));

        // Copy non-null properties using the local helper
        BeanUtils.copyProperties(sprintDto, existingSprint, getNullPropertyNames(sprintDto));

        return sprintRepository.save(existingSprint);
    }

    @Override
    public void deleteSprint(String id) {
        if (!sprintRepository.existsById(id)) {
            throw new RuntimeException("Sprint not found with ID: " + id);
        }
        sprintRepository.deleteById(id);
    }

    // Local helper method to ignore null fields during update
    private String[] getNullPropertyNames(Object source) {
        BeanWrapper src = new BeanWrapperImpl(source);
        PropertyDescriptor[] pds = src.getPropertyDescriptors();

        return Arrays.stream(pds)
                .map(PropertyDescriptor::getName)
                .filter(name -> src.getPropertyValue(name) == null)
                .toArray(String[]::new);
    }
}